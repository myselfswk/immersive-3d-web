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
11. Luxury Automotive Showroom (PBR Clearcoat Paint + Contact Shadow)
12. Floating Glassmorphic Pill Navbar with Telemetry Badge
13. Cinematic Preloader & Splash Screen with Dual-Curtain Reveal
14. 3D-to-2D Screen Projected Hotspots
15. Fullscreen Kinetic Menu Overlay
16. Zero-Dependency Web Audio Synthesizer

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

## 11. Luxury Automotive Showroom (PBR Clearcoat Paint + Contact Shadow)

Never build cars from boxes. Use `bash scripts/download-car-model.sh` to get `car.glb` and `car_ao.png`.

```js
// 1. PBR Metallic Car Paint
const bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#0a0d12'), // Obsidian Black
  metalness: 0.95,
  roughness: 0.14,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
});

// 2. Contact Shadow Plane
const shadowTex = new THREE.TextureLoader().load('/models/car_ao.png');
shadowTex.colorSpace = THREE.SRGBColorSpace;
const shadowMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2.7, 5.2),
  new THREE.MeshBasicMaterial({
    map: shadowTex,
    blending: THREE.MultiplyBlending,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  })
);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = 0.01;
carGroup.add(shadowMesh);

// 3. Wheel Spin on Drag or Scroll
const wheels = [];
carModel.traverse((node) => {
  if (['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].includes(node.name)) {
    wheels.push(node);
  }
});
// in tick loop:
wheels.forEach(w => { w.rotation.x += spinSpeed; });
```

## 12. Floating Glassmorphic Pill Navbar with Telemetry Badge

```tsx
// Floating Awwwards-tier Pill Header (Next.js / Tailwind CSS)
<header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 py-5 pointer-events-none">
  <nav className="pointer-events-auto flex items-center justify-between gap-10 px-6 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
    <div className="flex items-center gap-3">
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
      <span className="text-xs font-semibold tracking-[0.3em] uppercase text-white">AETHELON</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.22em] text-zinc-400">
      <a href="#aero" className="hover:text-white transition-colors">Aero</a>
      <a href="#powertrain" className="hover:text-white transition-colors">Powertrain</a>
      <a href="#configurator" className="hover:text-white transition-colors">Atelier</a>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
        800V ARCHITECTURE
      </span>
      <a href="#configurator" className="px-4 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/20 text-cyan-300 text-[11px] uppercase tracking-[0.18em] hover:bg-cyan-500/10">
        Commission →
      </a>
    </div>
  </nav>
</header>
```

## 13. Cinematic Preloader & Splash Screen with Dual-Curtain Reveal

```tsx
// Dual-curtain split reveal with percentage counter
<div className="fixed inset-0 z-50 pointer-events-auto flex flex-col items-center justify-between overflow-hidden">
  <div className={`absolute top-0 left-0 w-full h-1/2 bg-[#060709] border-b border-white/10 transition-transform duration-800 ease-[cubic-bezier(0.85,0,0.15,1)] ${isDismissing ? '-translate-y-full' : 'translate-y-0'}`} />
  <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-[#060709] border-t border-white/10 transition-transform duration-800 ease-[cubic-bezier(0.85,0,0.15,1)] ${isDismissing ? 'translate-y-full' : 'translate-y-0'}`} />
  <div className={`relative z-20 flex flex-col items-center justify-center my-auto transition-opacity duration-500 ${isDismissing ? 'opacity-0 scale-95' : 'opacity-100'}`}>
    <span className="text-8xl font-extralight font-mono text-white">{percent}%</span>
    {ready && (
      <button onClick={() => dismiss(true)} className="mt-8 px-8 py-3 rounded-full bg-cyan-400 text-black font-semibold text-xs tracking-widest uppercase">
        Enter Experience 🔊
      </button>
    )}
  </div>
</div>
```

## 14. 3D-to-2D Screen Projected Hotspots

Project 3D coordinate pins into real-time screen pixels using `vector.project(camera)` inside the render loop:

```js
// in render loop:
const worldPos = hotspotLocalPos.clone().applyMatrix4(mesh.matrixWorld);
const screenPos = worldPos.clone().project(camera);

// convert normalized device coordinates (-1..1) to screen pixels:
const x = ((screenPos.x + 1) * canvasWidth) / 2;
const y = ((-screenPos.y + 1) * canvasHeight) / 2;
const isFacingCamera = screenPos.z < 1.0;

// Update UI pin position:
pinElem.style.transform = `translate3d(${x}px, ${y}px, 0)`;
pinElem.style.display = isFacingCamera ? 'block' : 'none';
```

## 15. Fullscreen Kinetic Menu Overlay

```tsx
<div className="fixed inset-0 z-50 flex flex-col justify-between p-12 bg-[#060709]/95 backdrop-blur-3xl text-white">
  <div className="flex justify-between items-center">
    <span className="text-xs font-mono tracking-widest text-zinc-400">DIRECTORY</span>
    <button onClick={onClose} className="px-4 py-2 rounded-full border border-white/20 text-xs font-mono">CLOSE ✕</button>
  </div>
  <nav className="flex flex-col gap-4 my-auto">
    {links.map((link) => (
      <a key={link.num} href={link.href} className="group flex items-baseline gap-6 text-6xl font-extralight uppercase text-zinc-400 hover:text-white transition-all">
        <span className="text-sm font-mono text-cyan-400">{link.num}</span>
        <span className="group-hover:translate-x-4 transition-transform">{link.label}</span>
      </a>
    ))}
  </nav>
</div>
```

## 16. Zero-Dependency Web Audio Synthesizer

Play tactile sci-fi UI clicks and whooshes in modern browsers with pure Web Audio:

```js
const ctx = new (window.AudioContext || window.webkitAudioContext)();

export function playTick() {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}
```

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
