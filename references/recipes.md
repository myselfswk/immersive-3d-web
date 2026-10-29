# Recipes — copy-paste effects that make a site feel expensive

Each recipe is self-contained and respects the skill's rules (one loop, damped input, no per-frame allocation, tier-gated). Adapt names to the project. Verify against the installed three version.

## Contents
1. Particle morph between shapes
2. Dissolve reveal with glowing edge
3. Image planes with scroll-velocity warp (gallery)
4. Raycast hover on a proxy mesh
5. Exploded view scrubbed by scroll
6. Scroll-driven GLB animation clips
7. Model "turntable on drag" with inertia
8. Mask/clip-path section transitions
9. Custom cursor (desktop only)
10. Lens flare / light shafts (cheap)

---

## 1. Particle morph between shapes

Build two position buffers with the same count (sphere, torus, text points, mesh surface samples via `MeshSurfaceSampler`).

```js
geo.setAttribute('position', new THREE.BufferAttribute(posA, 3));
geo.setAttribute('aTarget',  new THREE.BufferAttribute(posB, 3));
geo.setAttribute('aRand',    new THREE.BufferAttribute(rand, 1));
```
```glsl
// vertex
uniform float uMorph;            // 0..1 (drive from scroll beat, damped)
attribute vec3 aTarget; attribute float aRand;
void main(){
  float t = smoothstep(aRand * 0.5, aRand * 0.5 + 0.5, uMorph);    // per-particle delay = organic
  vec3 p = mix(position, aTarget, t);
  p += normalize(p) * sin(t * 3.14159) * 0.6;                       // burst outward mid-transition
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * uPixelRatio / -mv.z, 1.0, 64.0);
}
```
Per beat: `uMorph = damp(uMorph, beat.morph, 3, dt)`. Chain 3+ shapes with `aTarget2` or by swapping buffers when a transition completes.

## 2. Dissolve reveal with glowing edge

```glsl
// fragment (any ShaderMaterial; needs vNoise from vertex or compute snoise(vWorldPos*2.0))
uniform float uDissolve;           // 0 = hidden, 1 = shown
float n = vNoise * 0.5 + 0.5;
if (n > uDissolve) discard;
float edge = smoothstep(uDissolve - 0.06, uDissolve, n);          // 0..1 near the cut
col = mix(col, uEdgeColor * 3.0, edge);                           // >1 → blooms with post
```
Animate `uDissolve` via ScrollTrigger scrub. The HDR edge color is what makes bloom light it up.

## 3. Image planes with scroll-velocity warp (gallery)

```js
const geo = new THREE.PlaneGeometry(1.6, 1, 32, 32);
const mat = new THREE.ShaderMaterial({
  uniforms: { uTex: { value: tex }, uVelocity: { value: 0 }, uHover: { value: 0 } },
  vertexShader: `
    varying vec2 vUv; uniform float uVelocity;
    void main(){
      vUv = uv; vec3 p = position;
      p.z += sin(uv.x * 3.14159) * uVelocity * 0.35;   // bend with speed
      p.y += sin(uv.x * 3.14159) * uVelocity * 0.10;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragmentShader: `
    varying vec2 vUv; uniform sampler2D uTex; uniform float uVelocity, uHover;
    void main(){
      float s = uVelocity * 0.012 + uHover * 0.01;                  // RGB split
      vec4 c = vec4(texture2D(uTex, vUv + vec2(s,0.)).r, texture2D(uTex, vUv).g, texture2D(uTex, vUv - vec2(s,0.)).b, 1.0);
      gl_FragColor = c;
      #include <colorspace_fragment>
    }`,
});
tex.colorSpace = THREE.SRGBColorSpace;
```
Sync planes to DOM `<img>` rects (`getBoundingClientRect` cached on refresh; convert px → world units using the camera's visible height at the plane's z). Keep the DOM `<img>` in place (opacity 0) for SEO/a11y. Use KTX2/WebP textures ≤ 1024.

## 4. Raycast hover on a proxy mesh

```js
const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
let hovered = false, frame = 0;
addEventListener('pointermove', (e) => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
function pick() {                                   // call from update(), every 3rd frame, desktop only
  if (++frame % 3) return;
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObject(proxy, false).length > 0;   // proxy: invisible low-poly sphere (visible=false still raycasts if layers set; use material.visible=false)
  if (hit !== hovered) { hovered = hit; document.body.style.cursor = hit ? 'pointer' : ''; }
}
uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hovered ? 1 : 0, 8, dt);
```
Note: `mesh.visible = false` objects are skipped by `intersectObject`'s default behavior? Raycaster tests objects regardless of `visible` unless you filter; safest is `material.visible = false` on a proxy that stays in the scene.

## 5. Exploded view scrubbed by scroll

```js
parts.forEach((m) => { m.userData.home = m.position.clone(); m.userData.dir = m.position.clone().normalize(); });
// in update():
const e = THREE.MathUtils.smoothstep(state.progress, 0.4, 0.6) * 1.2;       // 0..1.2
parts.forEach((m) => m.position.copy(m.userData.home).addScaledVector(m.userData.dir, e));
```
For GLBs, group nodes in Blender by logical part and name them (`part_lens`, `part_body`) so the code can find them with `getObjectByName`.

## 6. Scroll-driven GLB animation clips

```js
const mixer = new THREE.AnimationMixer(gltf.scene);
const action = mixer.clipAction(gltf.animations[0]); action.play(); action.paused = true;
const dur = gltf.animations[0].duration;
// in update(): scrub, don't play
action.time = THREE.MathUtils.damp(action.time, beatProgress * dur, 6, dt);
mixer.update(0);                                                           // apply pose at current time
```

## 7. Turntable on drag with inertia

```js
let vx = 0, dragging = false, lastX = 0;
el.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); });
el.addEventListener('pointermove', (e) => { if (!dragging) return; vx = (e.clientX - lastX) * 0.01; lastX = e.clientX; });
el.addEventListener('pointerup',   () => { dragging = false; });
// in update():
object.rotation.y += vx; vx = THREE.MathUtils.damp(vx, 0, 4, dt);          // inertia
```
Add `touch-action: pan-y` to the element so vertical page scroll still works on touch.

## 8. Clip-path section transitions (DOM, GPU-cheap)

```css
.reveal-mask { clip-path: inset(0 0 100% 0 round 2rem); }
```
```js
gsap.to('.reveal-mask', { clipPath: 'inset(0 0 0% 0 round 0rem)', ease: 'none',
  scrollTrigger: { trigger: '.reveal-mask', start: 'top 80%', end: 'top 20%', scrub: true } });
```

## 9. Custom cursor (fine pointers only)

```js
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dot = document.querySelector('.cursor');
  const x = gsap.quickTo(dot, 'x', { duration: 0.25, ease: 'power3' });
  const y = gsap.quickTo(dot, 'y', { duration: 0.25, ease: 'power3' });
  addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); });
}
```
CSS: `.cursor{position:fixed;left:0;top:0;width:14px;height:14px;margin:-7px;border-radius:50%;background:#fff;mix-blend-mode:difference;pointer-events:none;z-index:50}`. Never hide the native cursor on text/inputs.

## 10. Cheap light shafts / flare

A camera-facing additive quad with a radial-gradient texture (or procedural `smoothstep` in a ShaderMaterial), `depthWrite:false`, placed at the rim-light position; scale with `1 + velocity * 0.3`. Far cheaper than god-ray post passes and reads as premium when tinted with the accent color.

---

## Troubleshooting quick table

| Problem | Fix |
|---|---|
| Object looks flat/plastic | Add env map + rim light; use `MeshPhysicalMaterial` clearcoat; lower roughness on metals |
| Banding in dark gradients | Use `HalfFloatType` framebuffer with post, add noise (dither), avoid 8-bit blur chains |
| Bloom blows out everything | Raise `luminanceThreshold` (0.8–0.95); lower intensity; ensure tone mapping is last |
| Colors look washed out with post | Renderer tone mapping must be `NoToneMapping` when `ToneMappingEffect` is used |
| Text over canvas unreadable | Add a soft radial scrim or move copy where scene is dark/calm; test contrast at all scroll positions |
| Blank canvas on iOS | Texture too large / memory; too many render targets; context lost; check KTX2 transcoder path |
| First scroll stutters | `compileAsync` before reveal; show hidden objects once during warmup (starter does this) |
| Pinned section jumps | Pin created after dependent triggers; or transformed ancestor; refresh after fonts |
