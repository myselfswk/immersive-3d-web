// Post-processing (lazy-loaded; tier-gated). Uses the pmndrs `postprocessing` package.
// All effects live in ONE EffectPass so they merge into a single fullscreen shader.
import * as THREE from 'three';
import {
  EffectComposer, RenderPass, EffectPass,
  BloomEffect, VignetteEffect, NoiseEffect, ChromaticAberrationEffect,
  ToneMappingEffect, ToneMappingMode,
} from 'postprocessing';

export function createPost(renderer, scene, camera, tier) {
  const composer = new EffectComposer(renderer, {
    frameBufferType: THREE.HalfFloatType,
    multisampling: tier.msaa ? 4 : 0,
  });
  composer.addPass(new RenderPass(scene, camera));

  const full = tier.post === 'full';

  const bloom = new BloomEffect({
    intensity: 0.65,
    luminanceThreshold: 0.72,
    luminanceSmoothing: 0.2,
    mipmapBlur: true,
    radius: 0.7,
    resolutionScale: full ? 1 : 0.5,
  });
  const vignette = new VignetteEffect({ offset: 0.28, darkness: 0.65 });
  const noise = new NoiseEffect({ premultiply: true });
  noise.blendMode.opacity.value = 0.12;
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });

  let chroma = null;
  const effects = [bloom];
  if (full) {
    chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0, 0),
      radialModulation: true,
      modulationOffset: 0.25,
    });
    effects.push(chroma);
  }
  effects.push(vignette, noise, tone); // tone mapping LAST

  composer.addPass(new EffectPass(camera, ...effects));

  return {
    composer,
    // scroll-velocity → chromatic aberration kick (high tier only)
    setVelocity(v) {
      if (chroma) chroma.offset.set(v * 0.0022, v * 0.0014);
    },
    setSize(w, h) { composer.setSize(w, h, false); },
    render(dt) { composer.render(dt); },
    dispose() { composer.dispose(); },
  };
}
