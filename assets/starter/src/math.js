// Pure helpers (unit-testable without a browser).

/**
 * Map a scroll position to a fractional beat index using section centers.
 * Each section gets equal "story time" no matter how tall/pinned it is.
 * @param {number} y         scrollY + viewportHeight/2
 * @param {number[]} centers absolute Y of each section's center (ascending)
 * @returns {number} f in [0, centers.length-1]
 */
export function beatFromScroll(y, centers) {
  const n = centers.length;
  if (n < 2) return 0;
  if (y <= centers[0]) return 0;
  if (y >= centers[n - 1]) return n - 1;
  let i = 0;
  while (i < n - 2 && y > centers[i + 1]) i++;
  const span = centers[i + 1] - centers[i] || 1;
  return i + (y - centers[i]) / span;
}

export const smoothstep01 = (t) => t * t * (3 - 2 * t);
