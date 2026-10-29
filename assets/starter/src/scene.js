import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import noise from './shaders/noise.glsl?raw';
import blobVert from './shaders/blob.vert.glsl?raw';
import blobFrag from './shaders/blob.frag.glsl?raw';
import partVert from './shaders/particles.vert.glsl?raw';
import partFrag from './shaders/particles.frag.glsl?raw';
import { AdaptiveQuality } from './quality.js';
import { createShowcase } from './showcase.js';
import { PALETTE, CAMERA, BEATS } from './theme.js';
import { smoothstep01 } from './math.js';

export { PALETTE };

const vec = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const makeRail = (set) => ({
  pos: new THREE.CatmullRomCurve3(set.pos.map(vec), false, 'centripetal'),
  look: new THREE.CatmullRomCurve3(set.look.map(vec), false, 'centripetal'),
});

export function createWorld(canvas, tier) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: tier.msaa && !tier.post, // with a composer, MSAA lives in the composer
    powerPreference: 'high-performance',
    alpha: false,
    stencil: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // switched off when post (ToneMappingEffect) is active
  renderer.toneMappingExposure = 1.0;

  const bg = new THREE.Color(PALETTE.bg);
  const scene = new THREE.Scene();
  scene.background = bg;
  scene.fog = new THREE.FogExp2(bg, 0.035);

  // --- Image-based lighting + key/rim (affects PBR objects only) ---------
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.85;
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffe6cf, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(new THREE.Color(PALETTE.b), 4.0);
  rim.position.set(-4, 2, -5);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);

  // --- Hero blob ----------------------------------------------------------
  const blobUniforms = {
    uTime: { value: 0 },
    uAmp: { value: BEATS[0].amp },
    uFreq: { value: BEATS[0].freq },
    uHue: { value: BEATS[0].hue },
    uVelocity: { value: 0 },
    uColorA: { value: new THREE.Color(PALETTE.a) },
    uColorB: { value: new THREE.Color(PALETTE.b) },
    uColorC: { value: new THREE.Color(PALETTE.c) },
  };
  const blobMat = new THREE.ShaderMaterial({
    uniforms: blobUniforms,
    vertexShader: noise + blobVert,
    fragmentShader: blobFrag,
  });
  const blobGeo = new THREE.SphereGeometry(1, tier.segments, tier.segments);
  blobGeo.computeBoundingSphere();
  blobGeo.boundingSphere.radius = 1.8; // displacement can exceed the base sphere
  const blob = new THREE.Mesh(blobGeo, blobMat);
  const blobGroup = new THREE.Group();
  blobGroup.add(blob);
  scene.add(blobGroup);

  // --- PBR showcase (procedural, or /models/hero.glb if present) ----------
  const showcase = createShowcase({ renderer, tier, palette: PALETTE });
  showcase.group.visible = false;
  showcase.group.scale.setScalar(0.0001);
  scene.add(showcase.group);

  // --- Particles ----------------------------------------------------------
  const count = tier.particles;
  const pos = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const scale = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 2.6 + Math.pow(Math.random(), 0.6) * 12; // shell keeps the middle clear
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(ph);
    rand[i] = Math.random();
    scale[i] = 0.4 + Math.random() * 1.2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  pGeo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
  pGeo.computeBoundingSphere();
  const pUniforms = {
    uTime: { value: 0 },
    uSize: { value: 38 },
    uPixelRatio: { value: 1 },
    uProgress: { value: 0 },
    uVelocity: { value: 0 },
    uColorA: { value: new THREE.Color(PALETTE.b) },
    uColorB: { value: new THREE.Color(PALETTE.c) },
  };
  const pMat = new THREE.ShaderMaterial({
    uniforms: pUniforms,
    vertexShader: partVert,
    fragmentShader: partFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // --- Camera rails (landscape + portrait) --------------------------------
  const rails = { landscape: makeRail(CAMERA.landscape), portrait: makeRail(CAMERA.portrait) };
  let rail = rails.landscape;
  const _p = new THREE.Vector3();
  const _l = new THREE.Vector3();

  // --- State ----------------------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!matchMedia('(pointer: coarse)').matches) {
    addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let width = 1, height = 1;
  let post = null;
  let baseFov = 38;

  const adaptive = new AdaptiveQuality({
    maxDpr: tier.maxDpr,
    onChange: (dpr) => applySize(dpr),
    onStarve: () => disablePost(),
  });

  function applySize(dpr = adaptive.dpr) {
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    pUniforms.uPixelRatio.value = dpr;
    if (post) post.setSize(width, height);
  }

  function resize() {
    width = canvas.clientWidth || innerWidth;
    height = canvas.clientHeight || innerHeight;
    camera.aspect = width / height;
    rail = camera.aspect < 0.8 ? rails.portrait : rails.landscape;
    baseFov = camera.aspect < 0.8 ? 38 + (0.8 - camera.aspect) * 30 : 38;
    camera.fov = baseFov;
    camera.updateProjectionMatrix();
    applySize();
    adaptive.bump();
  }

  async function enablePost() {
    if (!tier.post || post) return false;
    try {
      const { createPost } = await import('./post.js');
      post = createPost(renderer, scene, camera, tier);
      renderer.toneMapping = THREE.NoToneMapping; // ToneMappingEffect does it
      post.setSize(width, height);
      return true;
    } catch (err) {
      console.warn('[post] disabled:', err);
      post = null;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      return false;
    }
  }

  function disablePost() {
    if (!post) return;
    post.dispose();
    post = null;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(adaptive.dpr);
    renderer.setSize(width, height, false);
  }

  function sample(p, key) {
    const n = BEATS.length - 1;
    const f = clamp01(p) * n;
    const i = Math.min(Math.floor(f), n - 1);
    const s = smoothstep01(f - i);
    return BEATS[i][key] + (BEATS[i + 1][key] - BEATS[i][key]) * s;
  }

  let time = 0;
  let vel = 0;
  let show = 0;
  let hSmooth = 0;

  function update(dt, state, opts = {}) {
    const reduce = opts.reducedMotion;
    time += reduce ? dt * 0.2 : dt;

    const p = state.progress;
    vel = THREE.MathUtils.damp(vel, THREE.MathUtils.clamp(state.velocity / 3000, -1, 1), 5, dt);
    if (reduce) vel = 0;
    hSmooth = THREE.MathUtils.damp(hSmooth, state.h || 0, 5, dt);

    // camera on rail + idle sway + pointer parallax
    rail.pos.getPointAt(p, _p);
    rail.look.getPointAt(p, _l);
    pointer.x = THREE.MathUtils.damp(pointer.x, pointer.tx, 3, dt);
    pointer.y = THREE.MathUtils.damp(pointer.y, pointer.ty, 3, dt);
    camera.position.copy(_p);
    camera.position.x += pointer.x * 0.25 + Math.sin(time * 0.3) * 0.03;
    camera.position.y += -pointer.y * 0.15 + Math.cos(time * 0.25) * 0.03;
    camera.lookAt(_l);
    // FOV kick on fast scroll (subtle speed feel)
    const fovTarget = baseFov + Math.abs(vel) * 4;
    if (Math.abs(camera.fov - fovTarget) > 0.01) {
      camera.fov = THREE.MathUtils.damp(camera.fov, fovTarget, 6, dt);
      camera.updateProjectionMatrix();
    }

    // blob <-> showcase crossfade
    show = THREE.MathUtils.damp(show, sample(p, 'show'), 5, dt);
    const blobS = Math.max(0.0001, 1 - show);
    const showS = Math.max(0.0001, show) * 1.25;
    blobGroup.visible = show < 0.99;
    showcase.group.visible = show > 0.01;
    blobGroup.scale.setScalar(blobS);
    showcase.group.scale.setScalar(showS);

    // blob uniforms
    blobUniforms.uTime.value = time;
    blobUniforms.uAmp.value = THREE.MathUtils.damp(blobUniforms.uAmp.value, sample(p, 'amp'), 6, dt);
    blobUniforms.uFreq.value = THREE.MathUtils.damp(blobUniforms.uFreq.value, sample(p, 'freq'), 6, dt);
    blobUniforms.uHue.value = THREE.MathUtils.damp(blobUniforms.uHue.value, sample(p, 'hue'), 4, dt);
    blobUniforms.uVelocity.value = vel;
    blobGroup.rotation.y = sample(p, 'spin') + time * 0.05;
    blobGroup.rotation.x = pointer.y * 0.12;
    blobGroup.rotation.z = hSmooth * 1.6; // horizontal section "turns" the object

    if (showcase.group.visible) showcase.update(time, hSmooth * 2.0);

    // particles
    pUniforms.uTime.value = time;
    pUniforms.uProgress.value = p;
    pUniforms.uVelocity.value = vel;
    points.rotation.y = time * 0.01 + p * 0.6;

    adaptive.tick(dt);
    if (post) {
      post.setVelocity(vel);
      post.render(dt);
    } else {
      renderer.render(scene, camera);
    }
  }

  async function warmup() {
    resize();
    // Show the showcase briefly so its shaders compile now (not on first scroll)
    showcase.group.visible = true;
    showcase.group.scale.setScalar(1);
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
    else renderer.compile(scene, camera);
    renderer.render(scene, camera);
    showcase.group.visible = false;
    showcase.group.scale.setScalar(0.0001);
  }

  function dispose() {
    blobGeo.dispose(); blobMat.dispose();
    pGeo.dispose(); pMat.dispose();
    showcase.dispose();
    envRT.dispose();
    if (post) post.dispose();
    renderer.dispose();
  }

  return {
    renderer, scene, camera, resize, update, warmup, dispose, enablePost,
    loadShowcaseModel: (url, manager) => showcase.tryLoadGLB(url, manager),
    get hasPost() { return !!post; },
  };
}
