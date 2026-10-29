---
name: immersive-3d-web
description: Build award-quality, buttery-smooth, scroll-driven 3D websites (Three.js / React Three Fiber / WebGL / WebGPU, GSAP ScrollTrigger, Lenis smooth scroll, custom GLSL shaders, GLB models, post-processing). Use this skill whenever the user asks for a 3D website, WebGL landing page, interactive 3D hero, scroll-animated 3D scene, product configurator/showcase, 3D portfolio, "Awwwards-style" or "immersive" site, spinning/floating 3D objects, particles, shader backgrounds, or anything involving Three.js, R3F, GLTF/GLB, or camera-on-scroll animation — even if they never say "skill", "WebGL" or "Three.js". Covers art direction, stack choice, scaffolding, scroll choreography, performance budgets, mobile fallbacks, accessibility, and QA.
---

# Immersive 3D Web

You are building a 3D website that feels **designed, fast, and inevitable** — not a tech demo. Smoothness is the product. A beautiful scene at 30 fps loses to a modest scene at a locked 60 fps.

## The 8 laws (never break these)

1. **Story first, geometry second.** Every 3D moment must serve a message in the copy. If you can't say what a camera move *means*, delete it.
2. **One render loop.** One `requestAnimationFrame` source (use `gsap.ticker`). Lenis, ScrollTrigger and `renderer.render` all hang off it. Never run two loops.
3. **Scroll is the timeline.** Scroll position → one smoothed `progress` value → camera, uniforms, and DOM beats. Never animate the scene from scattered `setTimeout`s or independent tweens fighting each other.
4. **Damp, don't snap.** Anything bound to input (scroll, pointer) goes through frame-rate-independent damping (`THREE.MathUtils.damp`). Never lerp with a fixed factor.
5. **Budget before beauty.** Hit the budgets in `references/performance.md` (draw calls, triangles, texture memory, DPR cap, JS size) *before* adding polish. Adaptive quality is mandatory, not optional.
6. **Real HTML for real content.** Text, headings, links, and CTAs live in the DOM (SEO, a11y, selection, translation). The canvas is `aria-hidden` decoration/experience layered behind/over it.
7. **Degrade gracefully.** Handle: no WebGL, context loss, `prefers-reduced-motion`, low-end/mobile tier, slow network (poster + progressive load). The site must still be usable and attractive in each case.
8. **Procedural beats assets until assets are justified.** Start with shader/procedural/primitive scenes (tiny, instant, sharp). Bring in GLB only when the story needs a specific object, and then compress it (`scripts/optimize-model.sh`).

## Workflow

Follow these phases in order. Don't skip phase 0 or 2 — they're what separates "wow" from "demo".

### Phase 0 — Brief (≤ 1 minute of questions, then assume)
Pin down, or state your assumptions about: **subject/brand**, **mood** (e.g. luxe-dark, playful-pastel, brutalist, sci-fi, organic), **primary CTA**, **assets available** (GLB? logo? brand colors? fonts?), **audience/devices** (mobile-heavy?), **stack constraints** (React/Next? plain Vite? existing repo?). If the user gave a vague prompt, don't interrogate — pick a strong direction from `references/art-direction.md`, state it in 3 lines, and build.

### Phase 1 — Choose the stack
Read `references/stack.md`. Default decision:

| Situation | Use |
|---|---|
| New standalone site, scroll-story, max control & smallest bundle | **Vite + vanilla Three.js + GSAP/ScrollTrigger + Lenis** (starter in `assets/starter/`) |
| Existing React/Next.js app, or many interactive components/state | **React Three Fiber + drei + Lenis + GSAP** |
| Needs designer-authored scene with no code | Spline / Theatre.js export (mention trade-offs: heavier, less control) |
| User explicitly wants cutting-edge compute/TSL | `WebGPURenderer` with automatic WebGL2 fallback (see stack.md) |

Always check the **latest** stable versions with `npm view three version` etc. rather than trusting memory; APIs move (e.g. `three/addons`, `three/webgpu`, Lenis package name `lenis`).

### Phase 2 — Art direction (write it down before coding)
Read `references/art-direction.md`. Produce a short **Direction Card** at the top of your plan:
- Concept in one sentence · Palette (3–5 hex incl. one accent) · Type pair · Light rig · Hero object/scene · Motion personality (e.g. "slow, heavy, cinematic" vs "springy, playful") · The **3 signature moments** (hero, mid-story reveal, finale).

### Phase 3 — Scaffold
For vanilla: `bash scripts/scaffold.sh <target-dir>` copies `assets/starter/`, installs deps, and copies Draco/KTX2 decoders into `public/`. (The starter is a working scroll-driven scene: shader blob, particles, camera rail, Lenis+ScrollTrigger, adaptive quality, fallbacks.) Read the starter's `src/` files once before modifying — they encode the architecture:

```
src/theme.js      DIRECTION CARD in code: palette, camera rails (landscape + portrait), per-beat targets  ← edit first
src/main.js       boot, loader, wiring, fallbacks, ?debug overlay
src/scene.js      renderer, IBL, blob, particles, camera rail, crossfade, update(dt, state)
src/showcase.js   PBR hero object (procedural; auto-swaps to /public/models/hero.glb if present)
src/post.js       bloom + vignette + grain + chromatic aberration, ONE merged pass (lazy, tier-gated)
src/scroll.js     Lenis + ScrollTrigger, pinned horizontal section, split-text reveals, section-aware progress
src/math.js       pure helpers (beatFromScroll — equal story time per section, unit-tested)
src/split.js      accessible word splitter for masked headline reveals
src/ui.js         magnetic CTAs, section counter
src/quality.js    tier detection + adaptive DPR → then drops post if still slow
src/loaders.js    GLTF/Draco/KTX2/Meshopt (lazy)
src/shaders/      GLSL chunks (imported with ?raw)
scripts/report-size.mjs   `npm run build && npm run report` → gzip/brotli sizes vs budgets
```

The starter already ships these "wow" layers — **keep them unless the brief says otherwise, and tune rather than remove**: split-word headline reveals, pinned horizontal story section, blob→PBR-object crossfade with image-based lighting, scroll-velocity distortion + FOV kick + chromatic aberration, pointer parallax, particles, grain/vignette/bloom, magnetic CTAs, section counter + progress bar, portrait camera rails, adaptive quality, and no-WebGL / reduced-motion fallbacks.

### Phase 4 — Build the world
Start by editing `src/theme.js` (palette, camera keyframes, beats) and the HTML copy, then change geometry/materials. Read `references/shaders-and-materials.md` for lighting, tone mapping, PBR, custom shaders, particles, post-processing. Rules of thumb:
- Lighting does 70% of "premium": environment map + 1 key + 1 rim. Set `renderer.toneMapping = ACESFilmicToneMapping` (or `AgXToneMapping`), correct color spaces, `fog` for depth.
- Fewer, bigger, better-lit objects beat many small ones.
- Add subtle idle motion (breathing, drift) so the scene is alive even when scroll is still.

### Phase 5 — Choreograph scroll
Read `references/scroll-choreography.md`. Map each section to a **beat** (camera keyframe + uniform targets + DOM reveal). Keep scroll length proportional to content (≈ 100–150 svh per beat). Provide anchor nav via `lenis.scrollTo`.

### Phase 6 — Polish
Micro-details that sell it: pointer parallax (desktop only), scroll-velocity-driven distortion, cursor-aware hover on 3D objects, grain + vignette, preloader with real progress, page-entrance timeline, sound is **off by default**.

### Phase 7 — Performance + QA (required before saying "done")
Run through `references/performance.md` and `references/qa-checklist.md`. Run `npm run build && npm run report` for real bundle numbers. Actually verify: `renderer.info.render.calls/triangles`, bundle size (`npm run build`), a throttled-CPU run if you can, and the fallbacks (add `?nowebgl` / emulate reduced motion). Report the numbers to the user.

### Phase 8 — Deliver
Tell the user: how to run it, what the signature moments are, the quality tiers, the measured budget numbers, and 2–3 concrete "next upgrade" ideas (e.g. swap in their GLB, add a configurator, add WebGPU/TSL). Keep it brief.

## Non-negotiable technical rules

- **Renderer**: `antialias: true` only on tier high (or use post-process SMAA/FXAA), `powerPreference: 'high-performance'`, `alpha: false` unless you need DOM behind it, cap DPR: `Math.min(devicePixelRatio, tier.maxDpr)` (max 2, mobile 1.5).
- **Never allocate in the render loop** (`new Vector3`, `new Color`, arrays, closures). Hoist temporaries.
- **Dispose** geometries/materials/textures/render targets on teardown or route change.
- **Resize** via `ResizeObserver` on the canvas container; use `setSize(w, h, false)` and CSS for sizing; update on `visualViewport` for mobile address-bar changes. Use `100svh` not `100vh`.
- **Time**: use delta time from the ticker, never frame counts. Clamp `dt` (≤ 1/20 s) to survive tab switches.
- **Textures**: color maps `colorSpace = SRGBColorSpace`; data maps (normal/roughness/ORM) stay linear. Use KTX2 (Basis) for anything > 512 px; `anisotropy ≤ 8`.
- **Smooth scroll**: Lenis (`lerp ≈ 0.08–0.12` or `duration ≈ 1.1`), driven by `gsap.ticker`, `ScrollTrigger.update` on Lenis scroll, `gsap.ticker.lagSmoothing(0)`. Never use CSS `scroll-behavior: smooth` alongside Lenis.
- **Fixed canvas** behind content (`position: fixed; inset: 0; z-index: 0`), content above with `pointer-events` managed deliberately.
- **Reduced motion**: when `prefers-reduced-motion: reduce`, disable smooth scroll, camera sweeps, and shake; show a calm static or very slow scene.
- **Fonts**: preload 1–2 variable fonts, `font-display: swap`, avoid layout shift when text reveals animate (animate `transform`/`opacity` only).
- **No external CDNs for runtime assets** — bundle or self-host (privacy, reliability, caching).

## Anti-patterns (reject these on sight)

- Default grey `MeshStandardMaterial` cubes under a white ambient light.
- Auto-rotating model with no purpose, plus a scroll hijack that fights the user.
- Heavy glass/transmission/refraction on mobile; many real-time shadows; full-screen post stacks on low tier.
- 10 MB uncompressed GLB / 4K textures for a small hero object.
- Text rendered only in WebGL (unselectable, unsearchable) unless it's purely decorative.
- Fixed-factor `lerp(a, b, 0.1)` on input; layout-thrashing reads inside `onUpdate`.
- Scroll-jacking (`wheel` preventDefault with custom paging) on content pages. Smooth ≠ hijacked.
- A loading screen that lies (fake progress) or blocks > 3 s on 4G.

## Reference map — read only what the task needs

| File | Read when |
|---|---|
| `references/stack.md` | choosing/setting up libraries, R3F variant, WebGPU/TSL, versions, project layout |
| `references/art-direction.md` | starting any new site; picking concept, palette, light rigs, copy structure |
| `references/scroll-choreography.md` | building the scroll story, pinned scenes, velocity effects, horizontal sections, nav |
| `references/shaders-and-materials.md` | lighting, PBR/env maps, custom GLSL, particles, post-processing, glass alternatives |
| `references/performance.md` | budgets, asset pipeline, instancing, adaptive quality, profiling, mobile |
| `references/recipes.md` | adding particle morphs, dissolve, image-plane galleries, hover, exploded views, GLB clip scrubbing, cursor, plus a troubleshooting table |
| `references/qa-checklist.md` | before delivery: functional, perf, a11y, SEO, browser matrix, deploy |
| `assets/starter/` | vanilla Vite starter (copy with `scripts/scaffold.sh`) |
| `scripts/optimize-model.sh` | compressing a GLB (Draco/Meshopt + WebP/KTX2, dedupe, prune) |

## Output style when working with the user

Be concise and confident. Show the Direction Card, then build. Prefer making changes in files over pasting giant code blocks in chat. When you cut a feature for performance, say so and why. Always report measured numbers, never "should be fast".
