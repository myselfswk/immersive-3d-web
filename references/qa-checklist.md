# QA checklist (run before delivering)

Mark each item pass/fail. Report failures and what you did. Don't claim "done" with unchecked critical (★) items.

## Functional
- ★ `npm run build` succeeds; `npm run preview` works; no console errors/warnings.
- ★ Scroll top → bottom: camera path continuous, no pops, no sudden jumps at section boundaries.
- ★ Scroll back up: everything reverses cleanly (no stuck reveals, no orphaned states).
- Fast flick scroll, slow wheel, trackpad, keyboard (PgDn/Space/Home/End/arrows), touch, scrollbar drag all behave.
- Anchor nav links scroll correctly and update the active state.
- Resize / rotate device: camera reframes, ScrollTrigger refreshes, no stretched canvas.
- Tab away for 30 s and return: no time jump, no runaway animation.
- Reload mid-page: scroll restoration works, scene is in the right state.
- ★ Hot-reload/teardown doesn't leak (dispose is called; memory stable).

## Performance
- ★ Measured and reported: draw calls, triangles, texture count/memory estimate, JS gzip size, hero model size.
- ★ 60 fps desktop on scroll (DevTools perf or stats-gl); no long tasks > 50 ms during scroll.
- ★ Throttled test (CPU 4×): adaptive quality drops tier and stays smooth enough.
- No GC sawtooth in memory timeline during idle scroll.
- No shader-compile hitch on first scroll to each section (precompiled).
- Static images/fonts have explicit dimensions; CLS ≈ 0.
- Lighthouse mobile run recorded (Performance, Accessibility, Best Practices, SEO).

## Fallbacks and robustness
- ★ `?nowebgl` (or real WebGL disabled): page shows poster/CSS gradient fallback and all content/CTAs.
- ★ `prefers-reduced-motion: reduce`: no smooth-scroll hijack, no camera sweeps, scene static/slow, reveals instant.
- Low-end path (`?quality=low`) looks intentional, not broken.
- Context loss simulated (`WEBGL_lose_context`): page recovers or degrades gracefully.
- Slow network (Fast 3G): preloader progress is truthful; poster visible; content readable before 3D arrives.
- JS disabled: content readable (even without 3D).

## Accessibility
- ★ Canvas has `aria-hidden="true"` (decorative) and sits behind meaningful DOM content.
- ★ Semantic landmarks and headings (`header`, `main`, `section`, `h1` once, logical `h2`/`h3`).
- ★ Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text, over *all* parts of the animated background (test at several scroll positions).
- Focus visible on all interactive elements; tab order matches visual order; skip link present.
- Any 3D-only interaction has a keyboard/DOM equivalent.
- No flashing > 3 times/sec; no strobing from bloom/noise.
- Animated headline splits keep an accessible name (`aria-label` on original, `aria-hidden` on split spans).
- Sound (if any) is opt-in with a visible toggle.

## SEO and sharing
- `<title>`, meta description, canonical, Open Graph + Twitter image (a rendered still of the hero), `lang` attribute.
- Real text content in HTML (not only in canvas). Image `alt` text.
- `robots.txt` and sitemap if public.
- Structured data if it's a product/org page.

## Browser/device matrix
Chrome (Win/Mac), Safari macOS, Firefox, Edge, **iOS Safari** (most likely to break), Android Chrome. Check: scroll feel, address bar resize, DPR, fonts, blend modes, `100svh`.

## Deployment
- Brotli/gzip enabled; long-cache hashed assets; correct MIME for `.glb/.ktx2/.wasm`.
- Decoder paths (`/draco/`, `/basis/`) resolve in production (not only dev).
- HTTPS; no mixed content; no third-party runtime CDNs required.
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Debug UI and stats are excluded from the production bundle.

## Delivery report template

```
Direction: <1 line>
Stack: <versions>
Budgets (desktop high): calls X · tris Y · textures Z · JS N KB gz · hero GLB M MB
Quality tiers: high/mid/low (what changes)
Fallbacks: no-WebGL ✔ · reduced-motion ✔ · context-loss ✔
Lighthouse mobile: P __ / A __ / BP __ / SEO __
Known limitations: …
Next upgrades: …
```
