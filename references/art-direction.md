# Art direction reference

## Contents
1. The Direction Card
2. Concept library
3. Palettes
4. Typography
5. Light rigs
6. Camera and composition
7. Motion personality
8. Page structure template
9. Avoiding the generic look

## 1. The Direction Card

Write this before any code. Keep it to ~10 lines.

```
Concept:      one sentence (what is this site, what should the visitor feel)
Palette:      bg #____  surface #____  text #____  accent #____  (optional accent-2)
Type:         display ____ / body ____ (self-hosted, variable)
Hero object:  what is on screen at scroll 0
Light rig:    e.g. cool env + warm key + magenta rim
Motion:       slow/heavy | snappy/precise | playful/springy | liquid/organic
Signature 1:  hero (first 3 seconds)
Signature 2:  mid-story reveal (the "oh!" moment)
Signature 3:  finale + CTA
```

## 2. Concept library (pick or remix)

| Concept | Scene idea | Scroll story |
|---|---|---|
| **Product hero** (device, bottle, sneaker, watch) | Single GLB on a seamless studio floor, env-lit, subtle reflections | Orbit → exploded view → close-up detail → CTA |
| **Liquid / blob brand** | Noise-displaced iridescent sphere (starter) | Blob morphs per section, color shifts per beat |
| **Particle universe** | GPU points forming shapes (logo, planet, galaxy) | Particles disperse → reform into next shape |
| **Architectural / spatial** | Corridor or room, camera on a rail | Walk-through; each room = a section |
| **Abstract portfolio** | Floating planes with project images; hover distortion | Gallery with velocity-based warp |
| **Data landscape** | Terrain/bars/globe from real data | Camera tours key regions; DOM callouts |
| **Tunnel / flight** | Procedural tunnel, fog, speed lines | Speed ∝ scroll velocity |
| **Mechanical / exploded** | Parts separate along axes | Scrub explode amount with scroll |

Choose one hero concept. A site with 3 concepts feels like none.

## 3. Palettes (starting points; adapt to brand)

| Mood | bg | surface | text | accent |
|---|---|---|---|---|
| Luxe dark | `#07080b` | `#111319` | `#eef0f5` | `#c8a96a` |
| Electric | `#05060f` | `#0e1022` | `#f2f4ff` | `#6c5cff` + `#00e0c6` |
| Soft pastel | `#f4efe9` | `#ffffff` | `#1b1a1f` | `#ff6b4a` |
| Acid brutalist | `#0b0b0b` | `#161616` | `#f5f5f0` | `#d4ff00` |
| Deep ocean | `#03121c` | `#082433` | `#e6f4f7` | `#2de2c8` |

Rules: one dominant surface, one accent used sparingly (CTAs, highlights, rim light). Make the **3D scene palette equal the CSS palette** (feed CSS variables into shader uniforms) so the page and canvas feel like one piece.

## 4. Typography

- Pair a **characterful display** face with a quiet body face. Variable fonts, self-hosted woff2, `font-display: swap`, preload the display font.
- Fluid scale: `font-size: clamp(2.6rem, 7vw + 1rem, 8rem)` for hero; tight letter-spacing (`-0.02em` to `-0.04em`) on large display; line-height 0.95–1.05 for display, 1.5–1.65 body.
- Display candidates (check licenses): Space Grotesk, Syne, Unbounded, Instrument Serif, Fraunces, Clash Display / General Sans (Fontshare), Satoshi, Inter Tight.
- Large type + small mono labels (`01 / Intro`) is a reliable "designed" look.
- Keep text over 3D legible: use `mix-blend-mode: difference` sparingly, or a soft radial scrim, or position copy where the scene is calm.

## 5. Light rigs

Premium look = **environment + key + rim**, tone-mapped.

- **Studio product**: `RoomEnvironment` or custom HDR at `scene.environmentIntensity ≈ 0.6–1`, one `DirectionalLight` key (warm, 2–3), one back/rim light (cool/accent, 3–6) to carve edges.
- **Moody**: very low env (0.15–0.3), strong colored rim, fog matching bg, bloom threshold high.
- **Pastel/clean**: high env (1.0+), soft shadows baked into a floor texture, no bloom.
- Match `scene.background` and `scene.fog` colors to the page bg so the canvas edge disappears.
- Avoid pure black bg with pure white text at full contrast — go `#07080b` / `#eef0f5`.

## 6. Camera and composition

- FOV 30–45° for products (flatter, premium) · 50–60° for environments/tunnels. Wide FOV (>70°) looks cheap and distorts.
- Rule of thirds: put the object off-center and the headline opposite; swap sides each section for rhythm.
- Depth cues: fog, scale contrast (big near / small far), parallax layers, soft blurred foreground elements.
- **Mobile**: re-frame, don't just shrink — pull the camera back / raise the object above the text block; consider portrait-specific camera keyframes.
- Keep a consistent "up" and avoid roll unless it's a deliberate effect.

## 7. Motion personality

| Personality | Ease (GSAP) | Duration | Damping λ (`MathUtils.damp`) |
|---|---|---|---|
| Cinematic / heavy | `power3.out`, `expo.out` | 1.0–1.6 s | 3–4 |
| Precise / tech | `power2.out`, `power4.inOut` | 0.6–0.9 s | 6–8 |
| Playful | `back.out(1.4)`, `elastic.out(1,0.6)` (sparingly) | 0.5–0.9 s | 8–12 |
| Liquid | `sine.inOut`, noise-driven | 1.2–2.0 s | 2–3 |

Principles: stagger (60–120 ms), overlap actions, ease-out for entrances, never linear for UI. Idle motion 5–10× slower than interaction motion.

## 8. Page structure template (scroll story)

1. **Hero** (100svh): headline, 1-line sub, primary CTA, 3D hero alive. Preloader hands off into an entrance animation.
2. **Promise / problem** (100–120svh): one big statement; scene shifts (camera push-in, color shift).
3. **Feature beats ×3–4** (120–150svh each): label `01`, title, 2 lines, one supporting 3D change per beat.
4. **Proof**: logos / numbers / quote — calm moment, scene dims or slows.
5. **Finale + CTA** (100svh): scene resolves into its most beautiful composition; big CTA; footer.

Total ≈ 6–8 screens. Longer pages need a progress indicator and anchor nav.

## 9. Avoiding the generic look

- No default grey material. Every material gets intentional roughness/metalness/color from the palette.
- No lone rotating cube/torus-knot. Make the object *the brand's* object (or an ownable abstract form).
- Add **grain + vignette** (tiny cost, big cohesion). Add slight **chromatic aberration** only on fast scroll velocity.
- Use **negative space**; don't fill every pixel with 3D.
- Align DOM details to the scene: borders, labels, and counters reflect scroll progress.
- Test with the 3D layer hidden: the page must still read as a good design. And test with the DOM hidden: the scene must be beautiful alone.
