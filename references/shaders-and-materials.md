# Shaders, materials, lighting, post-processing

## Contents
1. Renderer setup for "premium"
2. Lighting recipes
3. PBR material rules
4. Custom shader patterns (GLSL)
5. Particles
6. Glass / transmission alternatives
7. Post-processing
8. Hover and interaction on 3D objects
9. GLB loading snippet

## 1. Renderer setup for "premium"

```js
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: tier.msaa, powerPreference: 'high-performance',
  alpha: false, stencil: false,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, tier.maxDpr));
renderer.outputColorSpace = THREE.SRGBColorSpace;        // default, keep it
renderer.toneMapping = THREE.ACESFilmicToneMapping;      // or AgXToneMapping for softer highlights
renderer.toneMappingExposure = 1.0;
scene.background = new THREE.Color(bg);
scene.fog = new THREE.FogExp2(bg, 0.045);                // match bg to dissolve distance
```
- Shadows off by default. If needed: one `DirectionalLight` shadow, `mapSize 1024`, tight frustum, `shadow.autoUpdate = false` for static scenes, or bake a contact-shadow texture.
- Use `renderer.info` to verify calls/triangles/textures.

## 2. Lighting recipes

Zero-asset neutral studio (great default):
```js
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;      // available in recent three; else tweak material.envMapIntensity
```
Add: key `DirectionalLight(0xffe8d0, 2.5)` from front-upper-left, rim `DirectionalLight(accent, 4)` from behind-right. Rim light is what separates "premium" from "flat".

Custom HDRI: `RGBELoader`/`EXRLoader` (or KTX2 cube) → `pmrem.fromEquirectangular` → set `scene.environment`; dispose the source texture afterward. Keep ≤ 1–2 MB (1k–2k equirect is plenty for reflections).

## 3. PBR material rules

- Metals: `metalness 1`, roughness 0.15–0.4, rely on env for color. Without env map metals look black.
- Plastics/ceramic: `MeshPhysicalMaterial` with `clearcoat 0.6–1`, `clearcoatRoughness 0.05–0.2` — cheap premium sheen.
- Fabric/soft: `sheen`, `sheenRoughness`, `sheenColor`.
- Iridescence: `MeshPhysicalMaterial.iridescence = 1`, `iridescenceIOR 1.3`, thickness range `[100, 400]`.
- Avoid pure white (0xffffff) albedo and pure black; use 0.9 / 0.04 equivalents.
- Normal maps: `normalScale` ~0.5–1; use tangent-space; keep linear color space.
- Texture packing: ORM (AO/Roughness/Metalness in R/G/B) = 1 texture instead of 3.
- Use **MatCap** (`MeshMatcapMaterial`) for ultra-cheap stylized shading on mobile.

## 4. Custom shader patterns (GLSL ShaderMaterial)

Include tone mapping and color space chunks at the end of the fragment shader so the custom material matches the rest of the scene:
```glsl
#include <tonemapping_fragment>
#include <colorspace_fragment>
```

Reusable building blocks (all in the starter):
- **Simplex noise** (`snoise(vec3)`) → displacement, flow, dissolve.
- **Displacement with analytic-ish normals**: displace the vertex, then re-derive the normal by displacing two nearby points along tangent/bitangent and crossing the differences. Gives smooth lighting on deformed spheres.
- **Fresnel**: `pow(1.0 - saturate(dot(N, V)), 3.0)` for rim glow and glassy edges.
- **Cosine palette** (iq): `a + b*cos(6.28318*(c*t+d))` for cheap rich gradients driven by noise + fresnel + scroll.
- **Dissolve/reveal**: `if (noise < uProgress) discard;` + emissive edge `smoothstep(uProgress, uProgress+0.05, noise)`.
- **Scroll-velocity warp** on image planes: `pos.z += sin(uv.x*3.14159) * uVelocity * 0.3;`
- **Gradient background plane / skydome**: a large inverted sphere or full-screen triangle with a noise-animated gradient costs one draw call and looks bespoke.

Uniform hygiene:
```js
uniforms: { uTime:{value:0}, uProgress:{value:0}, uVelocity:{value:0}, uColorA:{value:new THREE.Color(a)}, ... }
```
Update `uniforms.x.value` in place — never replace the uniform object. Use `precision highp float;` only in fragment where needed; `mediump` on mobile for particles is fine.

Extending built-in materials with `onBeforeCompile` (e.g. add wind sway to a PBR material) is powerful but fragile across three versions; pin the version and replace known `#include <begin_vertex>` chunk strings. Or use `three-custom-shader-material` which wraps this safely.

## 5. Particles

- Use `THREE.Points` + `ShaderMaterial`; positions in a `Float32Array`; animate **in the vertex shader** (time + noise), never per-particle in JS.
- Size attenuation: `gl_PointSize = uSize * uPixelRatio * (1.0 / -mvPosition.z);` clamp it.
- Soft sprite: `float d = length(gl_PointCoord - 0.5); alpha = smoothstep(0.5, 0.0, d);`
- `depthWrite: false`, `blending: THREE.AdditiveBlending` for glow; `transparent: true`.
- Counts: high 20–40k, mid 8–12k, low 2–4k.
- Morphing between shapes: store `aPositionA`, `aPositionB` attributes; `mix(A, B, uMorph)` with per-particle random delay `aRand` for organic transitions.
- Millions of particles → GPGPU (FBO ping-pong or WebGPU compute).

## 6. Glass / transmission alternatives

`MeshPhysicalMaterial.transmission` renders the scene again to a texture — expensive. Options:
- **Fake glass**: env reflection + fresnel + slight transparency + `depthWrite:false`; add a blurred bright-spot backdrop plane.
- **Single refraction pass** only for one hero object, `transmissionResolution` ≤ 512–1024 (lower = faster), `thickness` modest.
- On low tier: swap to the fake variant automatically (material LOD by tier).
- `drei <MeshTransmissionMaterial>` is gorgeous but heavy; use for one object, desktop tier only.

## 7. Post-processing (use the `postprocessing` package)

```js
import { EffectComposer, RenderPass, EffectPass, BloomEffect, VignetteEffect, NoiseEffect, ChromaticAberrationEffect, SMAAEffect } from 'postprocessing';
const composer = new EffectComposer(renderer, { multisampling: 0, frameBufferType: THREE.HalfFloatType });
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect({ intensity: 0.6, luminanceThreshold: 0.85, mipmapBlur: true }), new VignetteEffect({ darkness: 0.5 }), new NoiseEffect({ premultiply: true })));
```
Rules:
- Group effects into **one `EffectPass`** (it merges shaders). Separate passes = more fullscreen draws.
- Tier: high = bloom + vignette + grain + SMAA/MSAA; mid = vignette + grain (cheap); low = none (CSS grain overlay via a tiny PNG/SVG noise instead).
- With a composer, set `renderer.toneMapping = NoToneMapping` and add a `ToneMappingEffect` as the last effect (otherwise tone mapping is applied incorrectly).
- Bloom needs bright emissive pixels; keep `luminanceThreshold` high so only highlights glow.
- Render the composer instead of the renderer: `composer.render(dt)`. Resize with `composer.setSize(w, h)`.
- Never stack DOF + bloom + SSAO + motion blur on a marketing page. Choose one hero effect.

## 8. Hover and interaction on 3D objects

- Use `Raycaster` against a **single low-poly proxy mesh** (invisible), not the hero mesh. Throttle to every 2–3 frames and skip on touch.
- Normalized pointer: `x = e.clientX / innerWidth * 2 - 1`, `y = -(e.clientY / innerHeight) * 2 + 1`.
- Smooth the pointer with `damp` before applying to rotation/uniforms (`uPointer`).
- Cursor feedback: change CSS cursor and scale/emissive the object via damped uniform (`uHover`).
- Keyboard accessibility: any 3D-only interaction needs a DOM control (button/slider) equivalent.

## 9. GLB loading snippet

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const draco = new DRACOLoader().setDecoderPath('/draco/');
const ktx2 = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
const gltf = await new GLTFLoader(manager).setDRACOLoader(draco).setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder).loadAsync('/models/hero.glb');
gltf.scene.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.frustumCulled = true; } });
```
After loading: center/scale to a known unit size, set `material.envMapIntensity`, upgrade materials if needed (`MeshStandard` → `MeshPhysical` with clearcoat), call `renderer.compileAsync(scene, camera)` **before** revealing to avoid first-frame stutter.
