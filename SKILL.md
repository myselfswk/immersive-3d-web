---
name: immersive-3d-web
description: Build award-winning, buttery-smooth, interactive 3D websites for ANY domain (Personal Portfolios like landonorris.com, Tech Startups, Luxury Products, Architecture, Fashion, Creative Agencies, Automotive). Full Next.js App Router architecture with cinematic preloaders, splash screens, fullscreen kinetic menus, scroll-choreographed 3D camera rails, interactive 3D spatial inspectors, coordinate-projected hotspots, telemetry bento grids, and Web Audio. Covers Three.js, React Three Fiber, GSAP ScrollTrigger, Lenis smooth scroll, PBR shaders, and Awwwards Site of the Day standards.
---

# Immersive 3D Web Studio

You are building an award-winning digital flagship (Awwwards Site of the Day / FWA / `landonorris.com` caliber) — a **complete, multi-section interactive 3D website**, not a superficial hero widget or single-car demo.

## The 8 Universal Laws (Never break these)

1. **A Complete Website, Never Just a Hero.** Every project must ship the complete standard architecture:
   - **Cinematic Preloader & Splash Screen**: Telemetry counter (00% → 100%), sound toggle prompt, and dual-curtain reveal transition.
   - **Floating Navbar & Fullscreen Overlay Menu**: Audio toggle, section indicator (`BEAT // 01`), and a fullscreen kinetic typography menu overlay.
   - **Multi-Section Scroll Story**: Hero → Manifesto/Story → 3D Interactive Spatial Inspector → Telemetry Bento Grid → Project/Career Archive → Outro & Contact CTA + Footer.
2. **Universal & Domain-Agnostic.** This skill builds for **any domain**:
   - **Athletes & Creators** (e.g. `landonorris.com` style: racing telemetry, 3D helmet/equipment showcase, career archive, high-voltage neon).
   - **Tech & AI Startups** (quantum cores, spatial data landscapes, LiDAR point clouds).
   - **Luxury Products** (watches, jewelry, industrial design, audio hardware).
   - **Architecture & Real Estate** (spatial pavilions, structural lighting).
   - **Creative Portfolios & Agencies** (interactive 3D artifacts, project reels).
3. **Interactive 3D Stage with Screen-Projected Hotspots.** Don't just let the 3D object sit passively. Provide:
   - Inertial drag/orbit rotation (`THREE.MathUtils.damp`).
   - 3D-to-2D projected coordinate pins (`vector.project(camera)`) that pulse on the model and open telemetry drawers.
   - Shading Mode Switcher (PBR Photorealistic, Cyber Wireframe, X-Ray Hologram).
4. **Next.js First-Class Architecture.** Always build inside Next.js App Router with Tailwind CSS:
   - Canvas dynamically imported with `ssr: false` to guarantee 0 hydration errors.
   - Real semantic HTML for text, headings, and CTAs (SEO, accessibility, screen readers).
   - Never wipe out Next.js configurations. Use `scripts/scaffold-nextjs.sh`.
5. **Acoustic Design / Web Audio.** Top sites (like Lando Norris) feature tactile sound design. Provide a zero-dependency Web Audio API synthesizer for UI ticks, swooshes, and ambient sub-bass hum with an opt-in toggle (`components/AudioController.ts`).
6. **Scroll is the Master Timeline.** Scroll position drives the camera through 5+ narrative keyframe beats via `gsap.ticker` or damped scroll interpolation. Never run conflicting independent loops.
7. **Studio Lighting & ACES Tone Mapping.** Tone mapping (`ACESFilmicToneMapping`) + 3-point studio softbox + colored silhouette rim lights (Cyber Cyan `#00f0ff` or Lando Volt `#d2ff00`) + ground contact shadow plane.
8. **Budget Before Beauty.** Lock 60 FPS. Keep draw calls $\le 100$ desktop, $\le 40$ mobile; triangles $\le 1.5\text{M}$; hero assets $\le 2\text{MB}$.

---

## The 6 Standard Sections (Full Website Architecture)

| Section | Beat | Purpose & 3D Behavior |
|---|---|---|
| **0. Preloader** | Enter | Telemetry 0–100% counter, sound prompt, dual-curtain vertical wipe revealing the site |
| **1. Hero** | Beat 0 | Front 3/4 hero presentation with pointer parallax, masked display typography, scroll prompt |
| **2. Manifesto** | Beat 1 | Sweeping orbital camera move, high-contrast split typography, brand core values |
| **3. 3D Stage** | Beat 2 | Direct user orbit drag, shading toggles (PBR/Wireframe/Hologram), coordinate-projected hotspots |
| **4. Bento Grid** | Beat 3 | High-angle camera framing, 4-card telemetry specs grid with metric units |
| **5. Archive** | Beat 4 | Chronological career/project timeline rows with hover micro-interactions |
| **6. Dispatch** | Beat 5 | Dramatic wide pull-back finale, magnetic commission/contact CTA, and minimalist footer |

---

## Workflow

### Phase 0 — The Direction Card
State the design direction in 8 lines:
```
Concept:      [e.g. Lando Norris Athlete Portfolio / Quantum Hardware Showcase]
Palette:      bg #060709 · surface #0e1117 · accent #00f0ff (or #d2ff00 Volt) · text #ffffff
Type:         Editorial Display (Syne / Geist) + Monospace Telemetry
Hero Object:  [3D Kinetic Artifact / Custom GLB / Athlete Helmet / Product]
Light Rig:    Studio Top Softbox + Front Key + Electric Rim Silhouette
Audio:        Web Audio Synthesizer (UI clicks & whooshes)
Signature:    Dual-curtain preloader, 3D coordinate hotspots, and fullscreen kinetic menu
```

### Phase 1 — Scaffolding (Next.js)
Run:
```bash
bash scripts/scaffold-nextjs.sh <target-dir>
```
Injects all core components:
- `components/Preloader.tsx` (Cinematic curtain splash screen)
- `components/Navbar.tsx` (Floating pill header with sound toggle & section indicator)
- `components/FullscreenMenu.tsx` (Kinetic oversized typography menu)
- `components/SceneCanvas.tsx` (Universal 3D engine with camera rails & hotspots)
- `components/AudioController.ts` (Zero-file Web Audio synthesizer)
- `app/page.tsx` (Complete 6-section narrative layout)

*(Optional automotive model: `bash scripts/download-car-model.sh <public-dir>`)*

### Phase 2 — Asset Integration
- **Drop Any Custom 3D Model**: Place any optimized GLB in `public/models/hero.glb`. `SceneCanvas.tsx` automatically detects, centers, and lights it.
- **Or Keep the Procedural Kinetic Core**: If no model is provided, the starter renders a stunning cyberpunk kinetic gimbal core with iridescent PBR shaders and particle streams.

### Phase 3 — Customize Narrative & Telemetry
Edit `app/page.tsx` to customize:
1. Hero headline & subhead.
2. Manifesto copy.
3. Hotspot labels and telemetry drawers in `components/SceneCanvas.tsx`.
4. Bento grid metrics and units.
5. Archive milestones and contact dispatch email.

### Phase 4 — QA & Verification
Follow `references/qa-checklist.md`:
- Test curtain preloader dismissal with and without audio.
- Test 3D drag inertia in the Inspector stage.
- Test fullscreen overlay menu links and smooth scrolling.
- Verify 60 FPS and 0 console warnings with `npm run build`.

---

## Anti-Patterns (Reject on sight)

- ❌ Single-hero widget demos with no preloader, no menu, and no secondary content sections.
- ❌ Hardcoding skills exclusively for cars (must be universal for athletes, products, tech, portfolios).
- ❌ Primitive toy box/cylinder geometry.
- ❌ Overwriting existing framework configurations with Vite.
- ❌ Storing high-frequency scroll or mouse coordinates in React `useState`.
- ❌ Missing contact shadow plane (makes 3D models float awkwardly).
- ❌ Clunky rectangular headers with plain unstyled links.
