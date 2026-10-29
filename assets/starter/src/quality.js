// Quality tiers + adaptive resolution.
// Detect once at boot, then degrade quickly / never oscillate.

const TIERS = {
  high: { name: 'high', maxDpr: 2,   segments: 160, particles: 30000, msaa: true,  post: 'full' },
  mid:  { name: 'mid',  maxDpr: 1.5, segments: 112, particles: 12000, msaa: false, post: 'lite' },
  low:  { name: 'low',  maxDpr: 1,   segments: 64,  particles: 3000,  msaa: false, post: false  },
};

export function detectTier() {
  const forced = new URLSearchParams(location.search).get('quality');
  if (forced && TIERS[forced]) return { ...TIERS[forced] };

  const coarse = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;               // Chromium only; default mid-ish
  const saveData = navigator.connection && navigator.connection.saveData;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let name = 'high';
  if (coarse || cores <= 4 || mem <= 4) name = 'mid';
  if ((coarse && (cores <= 4 || mem <= 3)) || saveData || cores <= 2 || mem <= 2) name = 'low';
  if (reduce && name === 'high') name = 'mid';
  return { ...TIERS[name] };
}

// Watches frame time and steps the pixel ratio down when the GPU is struggling.
export class AdaptiveQuality {
  constructor({ maxDpr, onChange, onStarve }) {
    this.maxDpr = maxDpr;
    this.dpr = Math.min(devicePixelRatio || 1, maxDpr);
    this.onChange = onChange;
    this.onStarve = onStarve;     // called once when DPR is already minimal and we're still slow
    this.starved = false;
    this.acc = 0;
    this.frames = 0;
    this.warm = 1.0;            // seconds to ignore after load / resize
    this.step = 0.25;
    this.minDpr = 1;
  }

  // call every frame with clamped dt (seconds)
  tick(dt) {
    if (this.warm > 0) { this.warm -= dt; return; }
    this.acc += dt; this.frames++;
    if (this.frames < 45) return;
    const avgMs = (this.acc / this.frames) * 1000;
    this.acc = 0; this.frames = 0;
    if (avgMs > 22) {
      if (this.dpr > this.minDpr) {
        this.dpr = Math.max(this.minDpr, this.dpr - this.step);
        this.warm = 0.75;
        this.onChange(this.dpr);
      } else if (!this.starved) {
        this.starved = true;               // stage 2: drop post-processing
        this.warm = 0.75;
        if (this.onStarve) this.onStarve();
      }
    }
  }

  bump() { this.warm = 0.75; this.acc = 0; this.frames = 0; }
}
