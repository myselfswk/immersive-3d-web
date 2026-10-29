// ============================================================================
// DIRECTION CARD — edit this file first. Everything visual is driven from here.
// ============================================================================

export const PALETTE = {
  bg: '#07080b',
  a: '#6c5cff',   // primary
  b: '#00e0c6',   // accent
  c: '#ff4fa3',   // secondary accent
};

// Camera rails: one keyframe per [data-beat] section (same count as BEATS).
// Portrait keeps the object in the upper half and pulls back so text has room.
export const CAMERA = {
  landscape: {
    pos:  [[0.0, 0.2, 6.5], [2.6, 0.6, 4.4], [-2.2, 0.8, 4.0], [0.0, -0.1, 5.0], [0.0, 0.0, 8.5]],
    look: [[0.0, 0.0, 0.0], [0.0, 0.1, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]],
  },
  portrait: {
    pos:  [[0.0, 0.5, 9.2], [1.4, 0.9, 7.4], [-1.2, 1.0, 7.0], [0.0, 0.5, 7.4], [0.0, 0.4, 11.0]],
    look: [[0.0, -1.1, 0.0], [0.0, -0.9, 0.0], [0.0, -1.0, 0.0], [0.0, -1.0, 0.0], [0.0, -1.2, 0.0]],
  },
};

// Per-beat shader targets. `show` crossfades the blob into the PBR showcase object.
export const BEATS = [
  { amp: 0.16, freq: 1.2, hue: 0.60, spin: 0.0, show: 0 },
  { amp: 0.34, freq: 1.8, hue: 0.78, spin: 1.1, show: 0 },
  { amp: 0.10, freq: 0.9, hue: 0.28, spin: 2.2, show: 0 },
  { amp: 0.28, freq: 2.2, hue: 0.92, spin: 3.0, show: 1 },
  { amp: 0.06, freq: 1.0, hue: 0.55, spin: 3.6, show: 0 },
];
