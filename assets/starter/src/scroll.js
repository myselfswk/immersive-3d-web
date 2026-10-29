import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { beatFromScroll } from './math.js';
import { splitWords } from './split.js';
import { initMagnetic, createIndex } from './ui.js';

gsap.registerPlugin(ScrollTrigger);

// Single source of truth for scroll. Everything else reads `state`.
//   target   0..1  story progress (section-aware, see beatFromScroll)
//   progress 0..1  damped by the render loop
//   velocity px/s  (ScrollTrigger)
//   h        0..1  progress of the pinned horizontal section
export const state = { target: 0, progress: 0, velocity: 0, h: 0, index: 0 };

export function createScroll({ reducedMotion }) {
  ScrollTrigger.config({ ignoreMobileResize: true });

  let lenis = null;
  if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); // ONE loop drives Lenis
    gsap.ticker.lagSmoothing(0);
  }

  // Split headlines BEFORE any trigger measures layout
  const splitEls = gsap.utils.toArray('[data-split]');
  splitEls.forEach((el) => splitWords(el));

  const mm = gsap.matchMedia();

  // 1) Pinned horizontal section (desktop, motion allowed). Create pins FIRST so later triggers see the spacing.
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const wrap = document.querySelector('.h-wrap');
    const track = wrap && wrap.querySelector('.h-track');
    if (!wrap || !track) return;
    wrap.classList.add('is-h');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => { state.h = self.progress; },
      },
    });
    return () => { wrap.classList.remove('is-h'); state.h = 0; };
  });

  // 2) Text reveals (transform + opacity only)
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set('.hero .wi', { yPercent: 115 }); // hero words are revealed by main.js after the preloader

    splitEls.filter((el) => !el.closest('.hero') && !el.closest('.h-track')).forEach((el) => {
      gsap.fromTo(el.querySelectorAll('.wi'),
        { yPercent: 115 },
        {
          yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
    });

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });

    // Cards only need vertical reveals when the section is NOT horizontal (mobile / fallback)
    if (!document.querySelector('.h-wrap.is-h')) {
      gsap.utils.toArray('.card').forEach((el) => {
        gsap.from(el, { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' } });
      });
    }
  });

  // 3) Velocity (decays when scrolling stops)
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => { state.velocity = self.getVelocity(); },
  });
  gsap.ticker.add(() => { state.velocity *= 0.9; });

  // 4) Section-aware progress: each [data-beat] section gets equal story time
  const beats = gsap.utils.toArray('[data-beat]');
  let centers = [];
  const measure = () => {
    centers = beats.map((el) => {
      const host = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
      const r = host.getBoundingClientRect();
      return r.top + scrollY + r.height / 2;
    });
  };
  ScrollTrigger.addEventListener('refresh', measure);
  measure();

  const setIndex = createIndex(beats.length);
  setIndex(0);
  gsap.ticker.add(() => {
    if (centers.length < 2) return;
    const f = beatFromScroll(scrollY + innerHeight * 0.5, centers);
    state.target = f / (beats.length - 1);
    state.index = Math.round(f);
    setIndex(state.index);
  });

  // Anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const host = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
      if (lenis) lenis.scrollTo(host, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else host.scrollIntoView();
    });
  });

  initMagnetic();

  // Layout can change after fonts/images load
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());

  // Progress bar
  const bar = document.querySelector('.progress > i');
  gsap.ticker.add(() => { if (bar) bar.style.transform = `scaleX(${state.target})`; });

  return { lenis, state, ScrollTrigger };
}
