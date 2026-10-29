# Scroll choreography reference

## Contents
1. The core wiring (Lenis + GSAP + render loop)
2. Single progress source and damping
3. Camera rail
4. Beats: section-driven state
5. Pinned scenes
6. Scroll velocity effects
7. DOM reveals
8. Horizontal sections
9. Navigation and anchors
10. Mobile and touch
11. Reduced motion
12. Common bugs

## 1. The core wiring

```js
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });   // or { duration: 1.1 }
lenis.on('scroll', ScrollTrigger.update);                    // keep ScrollTrigger in sync
gsap.ticker.add((time) => lenis.raf(time * 1000));           // ONE loop drives Lenis
gsap.ticker.lagSmoothing(0);                                 // no catch-up jumps after lag

// Render in the same ticker, AFTER lenis.raf (register later or use priority):
gsap.ticker.add((time, deltaMs) => world.update(Math.min(deltaMs / 1000, 0.05), state));
```

Order matters: Lenis updates scroll → ScrollTrigger reads it → scene reads `state.progress` → render. Never call `renderer.render` from a second `requestAnimationFrame`.

Do **not** set `scroll-behavior: smooth` in CSS. Add Lenis's recommended CSS (`html.lenis, html.lenis body { height: auto }`, `.lenis.lenis-smooth { scroll-behavior: auto !important }`, `.lenis-stopped { overflow: hidden }`) if using its stylesheet, or replicate those rules.

## 2. Single progress source and damping

```js
const state = { target: 0, progress: 0, velocity: 0 };

ScrollTrigger.create({
  trigger: '#story', start: 'top top', end: 'bottom bottom',
  onUpdate: (self) => { state.target = self.progress; state.velocity = self.getVelocity(); },
});

// in world.update(dt):
state.progress = THREE.MathUtils.damp(state.progress, state.target, 6, dt); // λ 4–8 feels expensive
```

Lenis already smooths the *input*; the damp adds *camera inertia* so the 3D lags slightly behind the page, which reads as weight and depth. If it feels laggy, raise λ (8–10) or lower Lenis `lerp`'s smoothing — don't stack heavy smoothing on both.

## 3. Camera rail

Define the path with a few readable keyframes, interpolate with a spline.

```js
const pos = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.2, 7),
  new THREE.Vector3(2.5, 0.6, 4.5),
  new THREE.Vector3(-2, 1.0, 2.5),
  new THREE.Vector3(0, 0.0, 9),
], false, 'centripetal', 0.5);
const look = new THREE.CatmullRomCurve3([ /* same count of target points */ ]);

// per frame (reuse vectors!):
pos.getPointAt(p, _p); look.getPointAt(p, _l);
camera.position.copy(_p); camera.lookAt(_l);
```

Tips:
- `getPointAt` (arc-length) gives constant speed; `getPoint` follows control-point density.
- Use `'centripetal'` to avoid loops/overshoot.
- Add a tiny idle sway: `camera.position.x += Math.sin(t*0.3)*0.03`.
- Design keyframes to match sections: with N sections, section *i* centers at `p = i/(N-1)`. For *dwell* (hold still while text reads), repeat a keyframe (two near-identical points) or ease progress with a custom curve (`gsap.parseEase('power2.inOut')`).

## 4. Beats: section-driven state

Prefer **per-section targets** over one giant curve for non-camera properties (color, amplitude, object swaps):

```js
const beats = [
  { amp: 0.18, hue: 0.62, rot: 0.0 },
  { amp: 0.42, hue: 0.85, rot: 1.2 },
  { amp: 0.08, hue: 0.12, rot: 2.4 },
];
// sample with smooth interpolation between neighbors
function sample(p, key) {
  const f = p * (beats.length - 1), i = Math.min(Math.floor(f), beats.length - 2), t = f - i;
  const s = t * t * (3 - 2 * t);                // smoothstep
  return beats[i][key] + (beats[i + 1][key] - beats[i][key]) * s;
}
```

Alternatively one `ScrollTrigger` per section with `onToggle` to fire discrete events (swap model, start particle morph) and `scrub` for continuous values.

## 5. Pinned scenes

For a "stay on screen while something happens" beat:

```js
gsap.timeline({
  scrollTrigger: { trigger: '#feature', start: 'top top', end: '+=150%', pin: true, scrub: true, anticipatePin: 1 },
}).to(uniforms.uExplode, { value: 1, ease: 'none' })
  .to('.feature-copy', { opacity: 1, y: 0 }, '<0.2');
```

- `scrub: true` binds 1:1 (Lenis already smooths); use `scrub: 0.5` only if you disable Lenis smoothing.
- Because the canvas is `position: fixed`, you usually don't need to pin the canvas — pin only DOM text or use extra scroll height.
- Don't nest pins. Keep pinned spacing in `px`-independent units (`+=150%`).
- Call `ScrollTrigger.refresh()` after fonts/images load and after resize (ScrollTrigger auto-handles most; fonts need a manual `document.fonts.ready.then(...)`).

## 6. Scroll velocity effects (high-impact, low cost)

```js
// state.velocity in px/s from ScrollTrigger
const v = THREE.MathUtils.clamp(state.velocity / 3000, -1, 1);
uniforms.uVelocity.value = THREE.MathUtils.damp(uniforms.uVelocity.value, v, 5, dt);
```
Use `uVelocity` to: stretch/skew image planes, increase noise amplitude, add chromatic aberration, increase particle speed, add subtle camera FOV kick (`fov = base + |v|*4`). Always damp back to 0 so it settles.

## 7. DOM reveals

Animate **transform + opacity only**. Split lines (not letters) for headlines unless it's a hero moment; for char/word splits use GSAP SplitText (now free in recent GSAP) or a tiny custom splitter; keep `aria-label` on the original so screen readers read it once.

```js
gsap.utils.toArray('[data-reveal]').forEach((el) => {
  gsap.from(el, {
    y: 40, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
  });
});
```
Hide initial states via CSS only when JS is running (`html.js [data-reveal]{opacity:0}`) so no-JS users still see content.

## 8. Horizontal sections

```js
const track = document.querySelector('.h-track');
gsap.to(track, {
  x: () => -(track.scrollWidth - innerWidth),
  ease: 'none',
  scrollTrigger: { trigger: '.h-wrap', pin: true, scrub: true, end: () => '+=' + (track.scrollWidth - innerWidth), invalidateOnRefresh: true },
});
```
Use sparingly (once per site). Provide vertical fallback on mobile/reduced motion.

## 9. Navigation and anchors

```js
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    e.preventDefault();
    lenis.scrollTo(id, { offset: 0, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  }));
```
- Update the URL hash with `history.replaceState` per section; restore on load.
- Show a slim progress bar/section index synced to `state.target` (nice affordance for long stories).
- Stop scroll during modals: `lenis.stop()` / `lenis.start()`.

## 10. Mobile and touch

- Native touch scrolling is already smooth; Lenis `syncTouch` is off by default—leave it **off** (iOS momentum feels better native).
- Use `100svh`/`100dvh`; avoid layout that depends on address bar collapse. Call `ScrollTrigger.config({ ignoreMobileResize: true })` to stop refresh storms when the URL bar toggles.
- Remove hover-only interactions; use tap/scroll-based alternatives.
- Reduce scroll length (~80%) on phones; shorten reveal distances.

## 11. Reduced motion

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce) { /* no Lenis, no camera sweep, no velocity fx, static composition, instant reveals */ }
```
Listen for changes (`matchMedia(...).addEventListener('change', ...)`) and tear down/restore.

## 12. Common bugs

| Symptom | Cause / fix |
|---|---|
| Jittery scroll, text shaking | Two rAF loops or Lenis not driven by `gsap.ticker`; `lagSmoothing` not 0 |
| ScrollTrigger positions wrong after load | Fonts/images changed layout: refresh on `document.fonts.ready` and `load` |
| Scene "jumps" on tab return | Unclamped `dt`; clamp to ≤ 0.05 |
| Pinned section leaves a gap | Pin spacer + `transform` on ancestors; keep `pin` targets out of transformed parents |
| Anchors land off by a section | Lenis `scrollTo` while ScrollTrigger pin spacing not yet computed → refresh first |
| Canvas blocks clicks | Canvas `pointer-events: none` unless it needs input; put interactive layers above |
| Scroll feels floaty on trackpad | Lenis `lerp` too low (<0.06); raise to 0.1 and test with wheel + trackpad |
