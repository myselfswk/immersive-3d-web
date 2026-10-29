import gsap from 'gsap';

// Magnetic CTA buttons (fine pointers only)
export function initMagnetic() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.cta').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.25);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

// "02 / 05" section counter
export function createIndex(total) {
  const el = document.getElementById('idx');
  const tot = document.getElementById('idx-total');
  if (tot) tot.textContent = String(total).padStart(2, '0');
  let last = -1;
  return (i) => {
    if (!el || i === last) return;
    last = i;
    el.textContent = String(i + 1).padStart(2, '0');
  };
}
