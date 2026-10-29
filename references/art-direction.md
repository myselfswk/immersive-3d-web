# Art direction reference

## Contents
1. The Direction Card
2. Case Study: The `landonorris.com` & Awwwards SOTD Flagship Blueprint
3. Concept Library (Universal Domains)
4. Palettes & Contrast Ratios
5. Typography & Kinetic Masks
6. Light Rigs & Studio Shading
7. Camera Rails & Multi-Beat Composition
8. Motion Personality & Damping
9. Avoiding the Generic AI Look

---

## 1. The Direction Card

Write this before any code. Keep it to ~10 lines.

```
Concept:      [e.g. Lando Norris Athlete Portfolio / Quantum Hardware Showcase]
Palette:      bg #060709 · surface #0f1218 · accent #00f0ff (or #d2ff00 Volt) · text #ffffff
Type:         Editorial Display (Syne / Geist) + Monospace Telemetry
Hero Object:  [3D Kinetic Artifact / Custom GLB / Athlete Helmet / Product]
Light Rig:    Studio Top Softbox + Front Key + Electric Rim Silhouette
Audio:        Web Audio Synthesizer (UI clicks & whooshes)
Signature:    Dual-curtain preloader, 3D coordinate hotspots, and fullscreen kinetic menu
```

---

## 2. Case Study: The `landonorris.com` & Awwwards SOTD Blueprint

Websites like **landonorris.com** (built by OFF+BRAND) achieve award-winning acclaim by refusing to look like a standard corporate brochure or generic resume. They combine motorsport-grade telemetry with high-fashion art direction:

### A. The Cinematic Preloader / Entry Ritual
- **The Philosophy**: Luxury is an entrance ritual. A blank page that pops in feels cheap; a numbered telemetry counter (00% → 100%) that builds anticipation feels expensive.
- **Dual-Curtain Split Reveal**: The top half of the screen slides up while the bottom slides down using a cubic-bezier curve (`cubic-bezier(0.85,0,0.15,1)`), slicing open to reveal the 3D scene.
- **Audio Permission Prompt**: Modern browsers block autoplaying sound. Give the visitor an intentional choice: `"ENTER WITH AUDIO 🔊"` or `"MUTE INTRO"`.

### B. High-Voltage Neon on Carbon Black
- **Background**: Deep carbon black (`#060709` or `#0b0c10`) absorbing ambient light.
- **Accent**: Blazing high-voltage neon (e.g. Cyber Cyan `#00f0ff` or Lando Norris Volt `#d2ff00`) used strictly for interactive states, rim lights, and live telemetry badges.
- **Surface**: Translucent frosted dark panels (`bg-black/60 backdrop-blur-2xl border border-white/10`).

### C. Full-Screen Kinetic Menu
- When the visitor clicks "MENU", the page transforms into an immersive full-screen overlay with oversized typographic links (`01 // OVERVIEW`, `02 // PHILOSOPHY`, `03 // 3D STAGE`).
- Hovering over a link triggers a subtle horizontal drift and reveals a micro-tag (`[DISPATCH] ↗`).

### D. 3D Coordinate-Projected Hotspots
- Floating UI badges attached directly to 3D mesh points (`vector.project(camera)`).
- As the user drags or scrolls, the pins track the 3D geometry with zero delay, opening telemetry detail cards on hover/click.

### E. Telemetry Bento Grid & Career Archive
- Precision engineering data delivered in high-contrast bento cards.
- Clean chronological timeline rows documenting milestones, championship points, or product releases.

---

## 3. Concept Library (Universal Domains)

| Domain | Hero 3D Object | Narrative Arc | Key Aesthetic |
|---|---|---|---|
| **Athletes & Creators** (Lando Norris style) | 3D Helmet / Equipment / Trophy / Kinetic Core | Preloader → On-Track Telemetry → 3D Inspection → Career Archive → Contact | High-voltage neon, carbon fiber, F1 telemetry |
| **Tech & AI Hardware** | Quantum Processor / LiDAR Sensor / Spatial Cube | Hero → Quantum Architecture → Interactive Hotspots → Benchmarks → Order | Deep obsidian, holographic wireframe, laser cyan |
| **Luxury Products** (Watches, Audio) | Timepiece / Precision Headphones / Bottle | Entry → Craftsmanship Manifesto → Exploded View → Specs → Inquire | Champagne gold, studio softbox, warm chiaroscuro |
| **Architecture & Spatial** | Pavilion / Kinetic Monolith / Urban Matrix | Walkthrough → Materiality → Structural Hotspots → Blueprint → Commission | Concrete grey, architectural glass, raw brutalism |
| **Creative Studios & Agencies** | Morphing Sculpture / Spatial Project Cube | Showreel Hero → Philosophy → Project Stage → Awards → Dispatch | Pure monochrome, kinetic typography, magnetic drag |

---

## 4. Palettes

| Mood | bg | surface | text | accent |
|---|---|---|---|---|
| **Lando Volt (Racing)** | `#060709` | `#0f1218` | `#ffffff` | `#d2ff00` (Electric Volt) + `#38bdf8` |
| **Cyber Cyan (Flagship)** | `#060709` | `#0c0f14` | `#ffffff` | `#00f0ff` (Photon Cyan) + `#818cf8` |
| **Obsidian Gold (Luxe)** | `#07080b` | `#111319` | `#eef0f5` | `#c8a96a` (Champagne Gold) |
| **Minimalist Monochrome** | `#0a0a0c` | `#121215` | `#ffffff` | `#f4f4f5` (Pure Titanium) |

---

## 5. Typography & UI Structure

- **Display**: High-contrast, tight tracking (`tracking-[-0.04em]`), uppercase. Recommended: Syne, Geist, Space Grotesk, Clash Display.
- **Telemetry & Badges**: Monospaced labels (`font-mono tracking-[0.25em] text-[10px] uppercase text-zinc-400`).
- **Hairline Borders**: `border border-white/10` throughout all cards and floating pills.
- **Selection**: `selection:bg-cyan-500/30 selection:text-cyan-200`.

---

## 6. Light Rigs & Studio Shading

- Tone Mapping: Always use `renderer.toneMapping = THREE.ACESFilmicToneMapping` with `toneMappingExposure = 1.05`.
- 3-Point Studio Rig:
  1. Ambient: Deep slate navy (`#0f172a`, intensity 1.8).
  2. Overhead Key: Studio softbox (`#ffffff`, intensity 3.0).
  3. Front-Quarter Key: Neutral fill (`#e0f2fe`, intensity 2.2).
  4. Rim Light: Colored accent (`#00f0ff` or `#d2ff00`, intensity 4.0) highlighting aerodynamic edges.
  5. Studio Floor: Ground perspective grid (`GridHelper`) + contact shadow plane under the hero object.

---

## 7. Camera Rails & Multi-Beat Composition

Choreograph camera across the 6 standard beats:
1. **Beat 0 (Hero)**: Front 3/4 perspective with cursor parallax.
2. **Beat 1 (Manifesto)**: Sweeping orbital macro tilt.
3. **Beat 2 (3D Stage)**: Center framing allowing user drag/orbit rotation.
4. **Beat 3 (Telemetry Bento)**: High-angle bird's eye perspective.
5. **Beat 4 (Archive)**: Low-angle tracking shot.
6. **Beat 5 (Dispatch / Outro)**: Cinematic ultra-wide pull-back.
