import * as THREE from 'three';
import { loadModel } from './loaders.js';

// The "product" object: a physically-based hero that the blob crossfades into.
// - Default: procedural iridescent torus-knot (zero download, shows off PBR + env lighting).
// - Drop an optimized GLB at /public/models/hero.glb and it replaces the procedural mesh automatically.

export function createShowcase({ renderer, tier, palette }) {
  const group = new THREE.Group();
  const low = tier.name === 'low';

  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(palette.a),
    metalness: 0.92,
    roughness: 0.2,
    clearcoat: low ? 0 : 1,
    clearcoatRoughness: 0.08,
    iridescence: low ? 0 : 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 420],
  });
  const geo = new THREE.TorusKnotGeometry(0.62, 0.21, low ? 128 : 256, low ? 16 : 48, 2, 3);
  const procedural = new THREE.Mesh(geo, mat);
  const holder = new THREE.Group();
  holder.add(procedural);
  group.add(holder);

  let custom = null;

  async function tryLoadGLB(url, manager) {
    try {
      const head = await fetch(url, { method: 'HEAD' });
      const type = head.headers.get('content-type') || '';
      // Vite dev server answers unknown paths with index.html — don't treat that as a model.
      if (!head.ok || type.includes('text/html')) return false;
      const gltf = await loadModel(renderer, url, manager);
      const obj = gltf.scene;
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
      const wrap = new THREE.Group();
      wrap.add(obj);
      wrap.scale.setScalar(1.7 / Math.max(size.x, size.y, size.z, 1e-3));
      holder.remove(procedural);
      holder.add(wrap);
      custom = wrap;
      return true;
    } catch (err) {
      console.warn('[showcase] GLB not loaded, keeping procedural object.', err);
      return false;
    }
  }

  function update(time, spin) {
    holder.rotation.y = time * 0.25 + spin;
    holder.rotation.x = Math.sin(time * 0.4) * 0.12;
    holder.position.y = Math.sin(time * 0.6) * 0.06;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
    if (custom) {
      custom.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          const m = Array.isArray(o.material) ? o.material : [o.material];
          m.forEach((mm) => {
            Object.values(mm).forEach((v) => v && v.isTexture && v.dispose());
            mm.dispose();
          });
        }
      });
    }
  }

  return { group, update, tryLoadGLB, dispose };
}
