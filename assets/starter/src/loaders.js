// Lazy GLTF loading with Draco + KTX2 + Meshopt.
// Decoders are copied to /public by scripts/copy-decoders.sh
// Usage:  const { scene } = await loadModel(renderer, '/models/hero.glb', manager);

export async function loadModel(renderer, url, manager) {
  const [{ GLTFLoader }, { DRACOLoader }, { KTX2Loader }, { MeshoptDecoder }] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/loaders/DRACOLoader.js'),
    import('three/addons/loaders/KTX2Loader.js'),
    import('three/addons/libs/meshopt_decoder.module.js'),
  ]);

  const draco = new DRACOLoader().setDecoderPath('/draco/');
  const ktx2 = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
  const loader = new GLTFLoader(manager)
    .setDRACOLoader(draco)
    .setKTX2Loader(ktx2)
    .setMeshoptDecoder(MeshoptDecoder);

  const gltf = await loader.loadAsync(url);
  draco.dispose();
  ktx2.dispose();
  return gltf;
}
