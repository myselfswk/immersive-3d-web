import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { detectTier } from './quality.js';
import { createWorld } from './scene.js';
import { createScroll, state } from './scroll.js';

const root = document.documentElement;
root.classList.add('js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('gl');
const loader = document.getElementById('loader');

function hasWebGL() {
  if (new URLSearchParams(location.search).has('nowebgl')) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function revealPage() {
  loader.classList.add('done');
  setTimeout(() => loader.remove(), 900);
  if (!reduced) {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to('.hero .wi', { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.07 })
      .from('.hero [data-intro]', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08 }, '-=1.0');
  }
}

async function boot() {
  createScroll({ reducedMotion: reduced });

  if (!hasWebGL()) {
    root.classList.add('no-webgl');
    revealPage();
    return;
  }

  const tier = detectTier();
  root.dataset.tier = tier.name;

  let world;
  try {
    world = createWorld(canvas, tier);
    await world.warmup();
    await world.enablePost();   // lazy chunk; falls back to plain rendering on failure
  } catch (err) {
    console.error('WebGL init failed', err);
    root.classList.add('no-webgl');
    revealPage();
    return;
  }

  // Resize (ResizeObserver covers viewport + visualViewport changes)
  new ResizeObserver(() => { world.resize(); }).observe(canvas);

  // Context loss: pause on loss, rebuild on restore
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); gsap.ticker.remove(tick); });
  canvas.addEventListener('webglcontextrestored', () => { location.reload(); });

  // Single render loop (after Lenis in registration order)
  function tick(_time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    state.progress = THREE.MathUtils.damp(state.progress, state.target, 6, dt);
    world.update(dt, state, { reducedMotion: reduced });
  }
  gsap.ticker.add(tick);

  revealPage();

  // Optional: drop an optimized GLB at /public/models/hero.glb to replace the procedural showcase
  world.loadShowcaseModel('/models/hero.glb');

  // Debug overlay: ?debug
  if (new URLSearchParams(location.search).has('debug')) {
    const el = document.createElement('pre');
    el.className = 'debug';
    document.body.appendChild(el);
    setInterval(() => {
      const i = world.renderer.info;
      el.textContent =
        `tier ${tier.name}  dpr ${world.renderer.getPixelRatio().toFixed(2)}  post ${world.hasPost}\n` +
        `calls ${i.render.calls}  tris ${i.render.triangles}\n` +
        `geo ${i.memory.geometries}  tex ${i.memory.textures}\n` +
        `progress ${state.progress.toFixed(3)}  beat ${state.index}  h ${state.h.toFixed(2)}`;
    }, 500);
  }

  // Dev: expose for console debugging
  if (import.meta.env.DEV) window.__world = world;
}

boot();
