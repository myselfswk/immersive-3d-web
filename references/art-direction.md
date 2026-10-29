# Art direction reference

## Contents
1. The Direction Card
2. Concept library
3. Luxury Automotive & High-End Flagship Standard (Awwwards / Porsche / Rimac)
4. Palettes
5. Typography & UI Structure
6. Light rigs
7. Camera and composition
8. Motion personality
9. Avoiding the generic AI look

## 1. The Direction Card

Write this before any code. Keep it to ~10 lines.

```
Concept:      one sentence (what is this site, what should the visitor feel)
Palette:      bg #____  surface #____  text #____  accent #____  (optional accent-2)
Type:         display ____ / body ____ (self-hosted, variable)
Hero object:  what is on screen at scroll 0 (must be real GLB asset or aerodynamic laser streamline)
Light rig:    e.g. overhead softbox + warm key + electric cyan rim
Motion:       slow/heavy | snappy/precise | playful/springy | liquid/organic
Signature 1:  hero (first 3 seconds, floating glassmorphic pill navbar & camera entrance)
Signature 2:  mid-story reveal (interactive paint customizer / exploded chassis)
Signature 3:  finale + CTA (order allocation / commission)
```

## 2. Concept library (pick or remix)

| Concept | Scene idea | Scroll story |
|---|---|---|
| **Luxury Automotive** | Real GLB hypercar (`scripts/download-car-model.sh`), metallic clearcoat paint, contact shadow, floor grid | Front 3/4 → aerodynamic profile → rear wing & diffuser → top-down aero |
| **Product hero** (device, bottle, watch) | Single GLB on a seamless studio floor, env-lit, subtle reflections | Orbit → exploded view → close-up detail → CTA |
| **Liquid / energy core** | Noise-displaced iridescent sphere or solid-state battery core | Morph per section, color shifts per beat |
| **Particle universe** | GPU points forming aerodynamic wind-tunnel streamlines | Streamlines flow across chassis with velocity |
| **Architectural / spatial** | Minimalist concrete/obsidian pavilion, camera on a rail | Walk-through; each space = a section |

Choose one hero concept. A site with 3 concepts feels like none.

---

## 3. Luxury Automotive & High-End Flagship Standard

Top-tier automotive digital experiences (Porsche Mission X, Rimac Nevera, Polestar, Lotus Evija) rely on **extreme restraint, cinematic contrast, and precision engineering cues**:

### The Navbar (Floating Glassmorphic Pill)
- **Never** use a boxy, full-width, solid header with plain text links.
- **Always** use a floating centered pill header:
  `backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-6 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)]`
- **Brand Emblem**: Tracked uppercase (`tracking-[0.3em] font-semibold text-xs md:text-sm`).
- **Telemetry Pill**: Small pulsing emerald/cyan indicator (`SYS: ONLINE // 800V ARCHITECTURE`).
- **Ghost Action**: Pill button with micro-glow (`border border-cyan-400/40 bg-cyan-950/20 text-cyan-300`).

### The 3D Vehicle Presentation
- **Asset Quality**: Use a real, multi-part, optimized GLB (`public/models/car.glb`) with separate body, rims, trim, glass, and wheels. Download with `bash scripts/download-car-model.sh`.
- **Contact Shadow Plane**: Cars look disconnected and fake if they float in empty space. A transparent contact shadow map (`public/models/car_ao.png`) with `THREE.MultiplyBlending` under the chassis anchors the vehicle to the studio floor.
- **PBR Car Paint**:
  ```js
  new THREE.MeshPhysicalMaterial({
    color: '#0a0d12',
    metalness: 0.95,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
  });
  ```
- **Studio Floor**: Dark circular pedestal or subtle perspective grid (`GridHelper` with low opacity `0.15–0.25`).

### The Telemetry & Configurator HUD
- Pinned bottom-center floating glass card providing:
  1. **Telemetry specs**: 0–100 km/h (e.g. 1.74s), Top Speed (412 km/h), Peak Output (2,050 HP).
  2. **Interactive Livery Selector**: Swatches (Obsidian Black, Cyber Cyan, Liquid Titanium, Apex Crimson) updating the `MeshPhysicalMaterial` in real time.
  3. **Camera View Presets**: One-click smooth camera pan between `Front 3/4`, `Side Profile`, `Aero Wing`, and `Top Down`.

---

## 4. Palettes (starting points; adapt to brand)

| Mood | bg | surface | text | accent |
|---|---|---|---|---|
| **Luxe Hypercar** | `#060709` | `#0f1218` | `#ffffff` | `#00f0ff` (Cyber Cyan) + `#cfd6df` (Titanium) |
| **Apex Crimson** | `#080607` | `#140d10` | `#f7f4f5` | `#e50914` (Rosso Corsa) + `#ff7300` |
| **Obsidian Gold** | `#07080b` | `#111319` | `#eef0f5` | `#c8a96a` (Champagne Gold) |
| **Electric Minimalist** | `#05060f` | `#0e1022` | `#f2f4ff` | `#6c5cff` + `#00e0c6` |

Rules: One dominant dark surface, one sharp accent used sparingly (CTAs, rim lights, telemetry dots). Make the **3D lighting palette match the UI palette**.

---

## 5. Typography & UI Structure

- **Display**: High-contrast, wide-tracked headers (`tracking-[-0.03em]` to `tracking-[0.1em]`, uppercase). Recommended: Syne, Geist, Space Grotesk, Clash Display.
- **Telemetry & Labels**: Monospaced labels (`font-mono tracking-[0.25em] text-[10px] uppercase text-zinc-400`).
- **Hairline Borders**: `border border-white/10` throughout cards and HUDs.
- **Selection**: `selection:bg-cyan-500/30 selection:text-cyan-200`.

---

## 6. Light rigs

Premium look = **studio environment + key + rim**, tone-mapped.

- **Studio automotive**:
  1. Ambient light: low, dark cool tone (`#141c28`, intensity 1.8).
  2. Overhead Key: Softbox light directly above car (`#ffffff`, intensity 3.2).
  3. Front-Quarter Key: Soft directional light (`#eef5ff`, intensity 2.5).
  4. Rim Light: Strong colored light behind the car (`#00f0ff`, intensity 3.8) highlighting body curves.
  5. Underglow / Point Light: Soft ground glow (`#00e5ff`, intensity 2.0).
- Tone mapping: `renderer.toneMapping = THREE.ACESFilmicToneMapping`, `renderer.toneMappingExposure = 1.05`.

---

## 7. Camera and composition

- FOV 38–45° for vehicles (flatter, cinematic, realistic proportions). Wide FOV (>70°) looks like a fish-eye toy.
- Damping: Smooth lerp or `THREE.MathUtils.damp()` with $\lambda = 5–7$.
- Mobile: Raise the car position or reframe camera back so the car stays above the text block.

---

## 8. Motion personality

| Personality | Ease (GSAP) | Duration | Damping λ (`MathUtils.damp`) |
|---|---|---|---|
| **Cinematic / Heavy** | `power3.out`, `expo.out` | 1.0–1.6 s | 3–5 |
| **Precise / Automotive** | `power2.out`, `power4.inOut` | 0.6–0.9 s | 6–8 |
| **Snappy Tech** | `power2.out` | 0.4–0.7 s | 8–10 |

---

## 9. Avoiding the generic AI look (Absolute Bans)

- ❌ **No toy box/cylinder cars**: Never glue together `BoxGeometry` and `CylinderGeometry` to represent a car. It immediately looks like cheap AI nonsense. Use `download-car-model.sh`.
- ❌ **No rectangular solid navbars**: Banned. Always use a floating glassmorphic pill header.
- ❌ **No bright rainbow gradients**: High-end luxury uses stark obsidian/charcoal with a single sharp metallic or photon accent.
- ❌ **No floating ungrounded meshes**: Always place a contact shadow texture or shadow plane under the car.
- ❌ **No flat plastic materials**: Always apply `metalness: 0.9` and `clearcoat: 1.0` to automotive paint.
