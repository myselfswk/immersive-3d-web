# Performance reference

Target: **locked 60 fps on a mid-range laptop and a 3-year-old phone**, first meaningful frame < 2.5 s on 4G, no jank while scrolling.

## Contents
1. Budgets
2. Quality tiers
3. Adaptive quality loop
4. Asset pipeline
5. Geometry and draw calls
6. Textures and memory
7. Render loop hygiene
8. Loading strategy
9. Profiling
10. Mobile specifics

## 1. Budgets

| Metric | Desktop (high) | Mobile / low |
|---|---|---|
| Draw calls (`renderer.info.render.calls`) | ≤ 100 | ≤ 40 |
| Triangles | ≤ 1.5 M | ≤ 300 k |
| Texture memory (GPU, decompressed) | ≤ 200 MB | ≤ 64 MB |
| Hero GLB (transferred) | ≤ 3 MB | ≤ 1.5 MB |
| Total page weight at first paint | ≤ 1.5 MB | ≤ 1 MB |
| JS (gzip) | ≤ 250 KB (three ≈ 150 KB tree-shaken + gsap + lenis) | same |
| Particles | 20–40 k | 2–4 k |
| Pixel ratio | ≤ 2 | ≤ 1.5 (often 1.25) |
| Post passes | ≤ 2 (merged) | 0 |
| Frame time CPU (JS) | ≤ 4 ms | ≤ 6 ms |

## 2. Quality tiers

Detect once at boot, then adapt at runtime.

```js
// quality.js (starter implements this)
high: { maxDpr: 2,    segments: 192, particles: 30000, post: true,  msaa: true  }
mid:  { maxDpr: 1.5,  segments: 128, particles: 12000, post: 'lite', msaa: false }
low:  { maxDpr: 1,    segments: 64,  particles: 3000,  post: false, msaa: false }
```
Signals: `navigator.hardwareConcurrency`, `navigator.deviceMemory` (Chromium only), `matchMedia('(pointer: coarse)')`, screen size × DPR, GPU renderer string via `WEBGL_debug_renderer_info` (use sparingly; it's being restricted), Save-Data / `navigator.connection.effectiveType`, `prefers-reduced-motion`.
Let the user override with `?quality=low|mid|high` for debugging.

## 3. Adaptive quality loop

Measure real frame times; degrade quickly, upgrade slowly (avoid oscillation).

- Sample the average `dt` over ~45 frames after a 1 s warm-up.
- If avg > 22 ms (below ~45 fps): step DPR down by 0.25 (min 1), then disable post, then reduce particles/segments.
- If avg < 13 ms for 5 s *and* we previously degraded: step back up at most once.
- Ignore frames while the tab was hidden or during resizes/loading.
- Adjust DPR via `renderer.setPixelRatio` + `setSize`; changing geometry segment count means rebuilding geometry → do it only at tier boundaries, ideally on load.
- Expose a `world.setQuality(q)` hook so scroll/section code never touches renderer settings directly.

## 4. Asset pipeline

```bash
bash scripts/optimize-model.sh input.glb public/models/hero.glb
```
What it does (via `@gltf-transform/cli`): dedupe → prune → weld → simplify (optional ratio) → resize textures to ≤ 2048 (≤ 1024 for mobile variants) → compress textures (WebP, or KTX2 if `toktx` available) → compress geometry (Meshopt or Draco). Typical result: 10–50× smaller.

Rules:
- Decimate in the DCC tool first (Blender Decimate / Quadric); target 20–100 k tris for a hero object.
- Bake lighting/AO into textures instead of using real-time shadows.
- Merge static meshes sharing a material.
- Prefer **one material, one texture atlas / ORM** per object.
- Ship a lower-res variant for mobile (`hero.mobile.glb`) when the hero is > 1 MB.
- Compress images for DOM too (AVIF/WebP, correct `width/height`, `loading="lazy"` below the fold).

## 5. Geometry and draw calls

- **InstancedMesh** for repeats (hundreds–thousands of identical meshes = 1 call). Update with `setMatrixAt` + `instanceMatrix.needsUpdate = true` only when changed; for animation, move work to a vertex shader using an instance attribute.
- `BufferGeometryUtils.mergeGeometries` for static scenery.
- Share geometries and materials across meshes (same reference).
- `frustumCulled = true` (default); for shader-displaced geometry that exceeds its bounds, set a manual bounding sphere instead of disabling culling.
- Use `LOD` or tier-based geometry swap for large scenes.
- Avoid `transparent: true` where possible: sorting + overdraw. If needed, `depthWrite: false` and limit screen coverage.
- Overdraw killers: huge transparent planes, stacked additive sprites, big blurred halos. Use smaller quads.

## 6. Textures and memory

- GPU memory ≈ width × height × 4 bytes × 1.33 (mips) for uncompressed. A 4096² texture ≈ 85 MB! KTX2/Basis stays compressed on the GPU (~4–8× smaller).
- Max sizes: hero color 2048; secondary 1024; roughness/normal 1024; mobile half that.
- `texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())`.
- Disable mipmaps for UI-like textures not minified (`generateMipmaps = false`, `minFilter = LinearFilter`).
- Dispose: `geometry.dispose()`, `material.dispose()`, every texture `.dispose()`, `renderTarget.dispose()`.
- Don't create `PMREMGenerator` outputs repeatedly; create once and dispose the generator after use.

## 7. Render loop hygiene

- Single ticker; clamp dt; **no allocation** per frame (hoist `Vector3`, `Color`, `Matrix4`).
- **Render on demand** if nothing moves (static hero + hidden canvas sections): keep a `needsRender` flag; set it on scroll, pointer move, uniform change, resize.
- Pause rendering when the tab is hidden (the ticker does this) and when the canvas is fully covered (e.g. a full-screen opaque DOM section/modal).
- Avoid reading layout (`getBoundingClientRect`, `offsetHeight`) in the loop; cache and update on resize/refresh.
- Update uniforms in place; avoid `material.needsUpdate = true` per frame (triggers recompiles).
- Avoid `scene.traverse` each frame; keep arrays of things that animate.
- Precompile: `await renderer.compileAsync(scene, camera)` during the loader to prevent first-scroll hitches (shader compile stalls are the #1 cause of "first interaction jank").

## 8. Loading strategy

- **First paint = HTML + CSS + poster** (a lightweight rendered still of the hero, WebP/AVIF, same background color) so the page never looks empty.
- Critical path: three core + hero scene (procedural) → start; heavy things (big GLB, HDRI, physics, post) load after first frame via dynamic `import()`.
- `THREE.LoadingManager` → real progress for the preloader (`onProgress(url, loaded, total)`); smooth the displayed number with damp so it doesn't jump.
- Preload critical: `<link rel="preload" as="font" type="font/woff2" crossorigin>`, `<link rel="preload" as="fetch" href="/models/hero.glb" crossorigin>`.
- Lazy-init sections: build below-the-fold 3D content when the user nears it (IntersectionObserver with `rootMargin: '100% 0px'`).
- Cap the preloader to ~3 s: if assets are slow, reveal with the procedural scene and stream the rest.

## 9. Profiling

- `renderer.info` → calls, triangles, geometries, textures. Log every 2 s in `?debug`.
- `stats-gl` (CPU/GPU ms), Chrome DevTools Performance: look for long tasks, GC spikes (sawtooth memory = allocation in loop), `Layout`/`Recalculate Style` during scroll (DOM thrash).
- Spector.js: inspect draw calls and state changes.
- Throttle: DevTools → CPU 4× slowdown + Fast 3G to simulate mid phone.
- Lighthouse: aim Performance ≥ 85 on mobile for a 3D page (it will not be 100); keep CLS ≈ 0, TBT low.
- Test on at least one real mid-range Android and one iPhone.

## 10. Mobile specifics

- iOS Safari: memory limits are strict; stay within 64 MB textures; avoid > 4 render targets; avoid `MSAA` + post together.
- `precision mediump float` is fine for particles/gradients; keep `highp` for positions/noise that show banding.
- Thermal throttling: a scene that's 60 fps for 10 s and 30 fps after a minute is a failed scene; test sustained runs and keep headroom (target ≤ 10 ms frame time).
- Avoid `backdrop-filter` blur layers over a WebGL canvas (very costly on mobile compositors).
- Use `touch-action: pan-y` on the canvas region if you handle pointer drags horizontally.
- Handle `webglcontextlost` / `webglcontextrestored`: `preventDefault()` on lost, pause loop, on restore re-init textures/render targets (or reload scene).
