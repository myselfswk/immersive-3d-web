# Stack reference

## Contents
1. Default stack and why
2. Verify versions first
3. Vanilla layout
4. React Three Fiber variant
5. WebGPU / TSL (optional)
6. Alternatives and when to use them
7. Physics, text, audio, extras
8. Build & deploy config

## 1. Default stack and why

| Layer | Pick | Why |
|---|---|---|
| Bundler | **Vite** | Instant HMR, `?raw` GLSL imports, tiny output, easy static deploy |
| 3D | **three** | The standard; biggest ecosystem; stable WebGL2 path |
| Scroll smoothing | **lenis** | Best-feeling inertial scroll; plays with native scroll + ScrollTrigger |
| Timeline / DOM motion | **gsap** (+ ScrollTrigger) | Precise scrubbing, pinning, matchMedia; free to use |
| Post-processing (optional) | **postprocessing** (pmndrs) | Merges effects into fewer passes than three's EffectComposer; better perf |
| Models | **GLB** via `GLTFLoader` + Draco/Meshopt + KTX2 | Smallest, fastest pipeline |
| Types (optional) | TypeScript | Worth it for >1 developer or >1000 lines |

Vanilla three is the default for **scroll-story marketing sites**: smaller bundle, no React reconciliation overhead, direct control of the single render loop.

## 2. Verify versions first

Training knowledge goes stale. Before writing imports:

```bash
npm view three version
npm view gsap version
npm view lenis version
npm view postprocessing version
npm view @react-three/fiber version
npm view @react-three/drei version
```

Facts that have been stable and are worth checking in the installed version's docs/changelog:
- Import addons from `three/addons/...` (alias of `three/examples/jsm/...`).
- Lenis npm package is `lenis` (older: `@studio-freight/lenis`). Import: `import Lenis from 'lenis'`.
- GSAP plugins ship inside the `gsap` package: `import { ScrollTrigger } from 'gsap/ScrollTrigger'`.
- `renderer.outputColorSpace = THREE.SRGBColorSpace` is default; textures use `.colorSpace`, not `.encoding`.
- R3F v9 pairs with React 19; R3F v8 pairs with React 18. Match them.

If the project already pins versions, **respect the pins**.

## 3. Vanilla layout (matches `assets/starter`)

```
index.html
public/
  draco/            # copied from node_modules/three/examples/jsm/libs/draco/gltf
  basis/            # copied from node_modules/three/examples/jsm/libs/basis
  models/           # optimized .glb
  textures/         # .ktx2 / .webp
  fonts/            # self-hosted woff2
src/
  main.js  scene.js  scroll.js  quality.js  loaders.js  style.css
  shaders/
```

Pattern: `scene.js` exports `createWorld(canvas, quality)` returning `{ update(dt, state), resize(w,h), dispose(), setQuality(q) }`. `scroll.js` exports `createScroll(onProgress)` returning `{ lenis, state }`. `main.js` is the only file that knows both. This separation lets you swap the scene without touching scroll, and vice versa.

## 4. React Three Fiber variant

Use when the site is already React/Next, or when you have many stateful 3D UI components (configurators, product pickers).

```bash
npm i three @react-three/fiber @react-three/drei gsap lenis
```

Key rules:
- **Don't use drei `<ScrollControls>` for long marketing pages** — it creates its own scroll container and fights Lenis/SEO. Instead: Lenis + GSAP ScrollTrigger update a **ref/store value** (`progress`), and `useFrame` reads it.
- Keep scroll state **out of React state** (no re-render per frame). Use a mutable ref or `zustand` with `getState()` inside `useFrame`.
- `<Canvas dpr={[1, 1.75]} gl={{ antialias: false, powerPreference: 'high-performance' }} frameloop="always">`; use `frameloop="demand"` + `invalidate()` for mostly-static scenes.
- `<PerformanceMonitor onDecline={() => setDpr(1)} />` and `<AdaptiveDpr pixelated />` from drei for adaptive quality.
- Load models with `useGLTF` (Draco/Meshopt auto handled; set decoder path if self-hosting) and `useGLTF.preload`.
- Wrap in `<Suspense>` with a real loader (`useProgress`).
- In Next.js: render the Canvas in a client component, `dynamic(() => import(...), { ssr: false })`, and keep text content in server components for SEO.

Minimal skeleton:

```jsx
// scrollStore.js
export const scroll = { progress: 0 };

// Scene.jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { MathUtils } from 'three';
import { scroll } from './scrollStore';

function Rig() {
  useFrame(({ camera }, dt) => {
    const t = scroll.progress;
    camera.position.z = MathUtils.damp(camera.position.z, 6 - t * 4, 6, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene() {
  return (
    <Canvas dpr={[1, 1.75]} gl={{ antialias: false, powerPreference: 'high-performance' }}
            style={{ position: 'fixed', inset: 0 }} aria-hidden>
      <Environment preset="city" />
      <Rig />
      {/* meshes */}
    </Canvas>
  );
}
```

## 5. WebGPU / TSL (optional, advanced)

Use only when the user asks for cutting-edge, or the effect truly needs compute (millions of particles, GPU fluid). Otherwise WebGL2 is more predictable.

- Import from `three/webgpu` and use `WebGPURenderer`; it **falls back to WebGL2 automatically** when WebGPU is unavailable.
- Write materials with **TSL** (Three Shading Language, `three/tsl`) instead of raw GLSL so they work on both backends.
- Must `await renderer.init()` before first render.
- Always test the fallback path (force with `forceWebGL: true`).
- Raw `ShaderMaterial` GLSL does **not** run on the WebGPU backend; pick one path per project.

## 6. Alternatives

- **Spline**: fastest for designers; runtime is heavy (~MBs), limited perf control. Fine for a quick hero; not for "smoothest".
- **Theatre.js**: visual timeline editor for three/R3F; great when a motion designer tunes camera paths. Adds bundle weight.
- **Babylon.js**: strong for game-like/product configurators; larger runtime; different ecosystem.
- **model-viewer** (`<model-viewer>`): easiest product 3D + AR on mobile; less art-directable.
- **OGL / regl**: ultra-light for pure shader backgrounds (a ~30 KB alternative to three when you only need a full-screen shader).

## 7. Extras

- **Physics**: `@dimforge/rapier3d-compat` (WASM; lazy-load it). Use sparingly; it costs bundle + CPU.
- **3D text**: prefer HTML text. For decorative 3D text use `troika-three-text` (SDF, crisp, cheap) rather than `TextGeometry` (heavy).
- **Audio**: off by default; opt-in toggle; `THREE.Audio` or Howler. Must be unlocked by a user gesture.
- **Debug**: `lil-gui` + `stats-gl` behind `?debug` query param; strip from production via dynamic import.
- **Image-based lighting assets**: `RoomEnvironment` (zero download) for neutral; `.hdr` → convert to `.exr`/`.ktx2` or PMREM-prebake for custom moods; keep ≤ 1–2 MB.

## 8. Build & deploy

`vite.config.js` essentials:

```js
import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: { output: { manualChunks: { three: ['three'], gsap: ['gsap'] } } },
  },
  assetsInclude: ['**/*.glb', '**/*.hdr', '**/*.ktx2'],
});
```

Deploy (Netlify/Vercel/Cloudflare Pages are all fine):
- Serve with **Brotli**. Cache `/assets/*` `immutable, max-age=31536000`; HTML `no-cache`.
- Set correct MIME for `.glb` (`model/gltf-binary`), `.wasm`, `.ktx2`.
- Preload the hero model/font with `<link rel="preload">`.
- Add `<meta name="theme-color">` matching the first screen to avoid a flash.
