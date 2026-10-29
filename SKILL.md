---
name: immersive-3d-web
description: Build award-quality, buttery-smooth, luxury 3D websites (Next.js App Router, Three.js, React Three Fiber, WebGL/WebGPU, GSAP ScrollTrigger, Lenis smooth scroll, PBR materials, GLB models, post-processing). Use this skill whenever the user asks for a 3D website, WebGL landing page, luxury car/automotive showcase, 3D configurator, interactive 3D hero, scroll-animated 3D scene, product showcase, 3D portfolio, "Awwwards-style" or "immersive" site — even if they never explicitly say "skill", "WebGL", or "Three.js". Covers art direction, Next.js architecture, car models, studio lighting, scroll choreography, performance budgets, and QA.
---

# Immersive 3D Web

You are building a 3D website that feels **luxurious, designed, fast, and inevitable** — an Awwwards Site of the Year digital flagship, not a toy AI demo. Smoothness and art direction are the product. A beautiful scene at 30 fps loses to an impeccably lit scene at a locked 60 fps.

## The 8 laws (never break these)

1. **Next.js first, never overwrite projects.** If the project is Next.js (or if the user asks for Next.js), build natively inside Next.js App Router. Never run a vanilla Vite script over an existing framework repo.
2. **No Frankenstein toy models.** Never attempt to build complex physical vehicles, watches, or industrial products out of primitive `BoxGeometry` or `CylinderGeometry` meshes. That looks like amateur low-level AI output. Always use an optimized, production-grade `.glb` model (run `bash scripts/download-car-model.sh` for automotive) with multi-part PBR materials and contact shadow planes. If the brief is purely abstract, render elegant aerodynamic wind-tunnel streamlines or laser wireframes, never toy blocks.
3. **Studio lighting does 70% of "luxury".** Metallic surfaces, car paint, and glass look like cheap plastic without reflections. Always use:
   - ACESFilmic or AgX tone mapping (`renderer.toneMapping = THREE.ACESFilmicToneMapping`).
   - 3-point studio lighting + soft top softbox + color-accented rim light (electric cyan, crimson, or champagne gold).
   - `MeshPhysicalMaterial` for car paint with `clearcoat = 1.0`, `clearcoatRoughness = 0.03`, `metalness = 0.9–1.0`, and `roughness = 0.12–0.2`.
   - Contact shadow plane (`car_ao.png`) or soft ground shadow so objects are anchored to the floor.
4. **Floating glassmorphic UI, zero AI clichés.** The navigation and HUD must look like Porsche, Rimac, or Polestar:
   - Floating glassmorphic pill navbar: `backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-6 py-3.5`.
   - Editorial typography with generous letter-spacing (`tracking-[0.25em] text-xs uppercase`).
   - Telemetry HUD badges (`0-100 KM/H: 1.74s`, `SYS // 800V ONLINE`).
   - Micro-interactions: interactive paint swatches, camera view transitions, and smooth hover underlines.
5. **One render loop.** One `requestAnimationFrame` source (use `gsap.ticker`). Lenis smooth scroll, camera damping, and `renderer.render` all synchronize together. Never run independent loops fighting each other.
6. **Scroll is the timeline.** Scroll position → one smoothed `progress` value → camera, uniforms, and DOM beats. Damp all inputs via frame-rate-independent damping (`THREE.MathUtils.damp`).
7. **Budget before beauty.** Cap DPR (`Math.min(devicePixelRatio, 2)`). Keep draw calls $\le 100$ desktop, $\le 40$ mobile. Triangles $\le 1.5\text{M}$ desktop, $\le 300\text{k}$ mobile. Total GLB weight $\le 2\text{MB}$.
8. **Real HTML for real content.** Headings, copy, and CTAs live in semantic DOM for SEO and accessibility. The WebGL canvas is `aria-hidden` background decoration.

## Workflow

### Phase 0 — Brief & Direction Card
State your assumptions or brief in a **Direction Card**:
```
Concept:      AETHELON APEX-01 — Ultra-Luxury Electric Hypercar Showcase
Palette:      bg #060709 · car #0a0d12 (Obsidian) · accent #00f0ff (Cyber Cyan) · text #ffffff
Type:         Editorial Display (Syne / Geist) + Monospace Telemetry
Light Rig:    Studio Softbox Top + Warm Front 3/4 + Cyan Rim Silhouette
Hero Object:  Optimized GLB Hypercar with metallic clearcoat PBR paint & contact shadow
Camera Rails: Front 3/4 (Hero) → Side Profile (Aero) → Rear Wing (Propulsion) → Top Down
Signature:    Live paint customizer, camera view presets, and telemetry HUD
```

### Phase 1 — Stack Decision
| Situation | Use |
|---|---|
| **Next.js App (Default / Recommended)** | **Next.js App Router + Tailwind CSS + Three.js (`ssr: false`) + Lenis + GSAP** (see `assets/nextjs-starter/`) |
| **Existing React / Next.js app with R3F** | **React Three Fiber (v9 for React 19) + @react-three/drei** |
| **Standalone micro-landing page** | **Vite + vanilla Three.js + GSAP + Lenis** (`assets/starter/`) |

### Phase 2 — 3D Asset Sourcing
- **For Cars / Automotive**: Run `bash scripts/download-car-model.sh <public-dir>`. This immediately fetches the battle-tested, production-ready 1.6MB sports car GLB (`car.glb`) and contact shadow map (`car_ao.png`).
- **For Custom Artist Models**: Run `bash scripts/optimize-model.sh input.glb public/models/hero.glb` (compresses 10x–50x with glTF-Transform, Draco/Meshopt, and KTX2/WebP).
- **If No 3D Model Exists**: Build an abstract aerodynamic wind-tunnel laser particle stream or glowing chassis hologram. **Never** assemble a fake car out of boxes/cylinders.

### Phase 3 — Scaffolding
- **For Next.js**: Run `bash scripts/scaffold-nextjs.sh <target-dir>` to inject the luxury showroom components (`Navbar.tsx`, `CarCanvas.tsx`, `ConfiguratorHUD.tsx`, `app/page.tsx`).
- **For Standalone Vite**: Run `bash scripts/scaffold.sh <target-dir>` (only when not in Next.js).

### Phase 4 — Materials & Studio Lighting
Set up physically realistic automotive materials in `CarCanvas.tsx`:
```javascript
// Metallic Clearcoat Car Paint
const paintMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#0a0d12'),
  metalness: 0.95,
  roughness: 0.14,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
});

// Ground Contact Shadow
const shadowMat = new THREE.MeshBasicMaterial({
  map: shadowTexture,
  blending: THREE.MultiplyBlending,
  transparent: true,
  opacity: 0.9,
});
```

### Phase 5 — Floating Luxury UI & Telemetry HUD
Implement:
1. **Floating Pill Navbar**: Centered glassmorphic container with brand mark, tracked links, 800V telemetry indicator, and a sleek commission CTA.
2. **Interactive Configurator HUD**: Paint swatch selector (Obsidian, Cyan, Titanium, Crimson) and instant camera view buttons (Front, Profile, Rear, Top).
3. **Editorial Typography**: Large high-contrast headlines with wide tracking (`tracking-[-0.03em]`), fine hairline borders (`border-white/10`), and monospaced telemetry figures.

### Phase 6 — Performance & QA
Before finishing, run through `references/performance.md` and `references/qa-checklist.md`:
- Check `renderer.info.render.calls` ($\le 100$).
- Verify model size is $\le 2\text{MB}$.
- Test responsive resizing and mobile viewports (`100svh`).
- Test graceful fallback if WebGL fails.

## Anti-patterns (reject these on sight)

- ❌ Assembling fake cars/watches from `BoxGeometry` and `CylinderGeometry`.
- ❌ Overwriting Next.js projects with Vite templates.
- ❌ Blocky, rectangular full-width navbars with plain unstyled blue links.
- ❌ Missing contact shadow planes (causes 3D models to awkwardly float in space).
- ❌ Missing tone mapping or ambient lighting (leaves metallic materials looking like flat plastic).
- ❌ Putting 60 FPS scroll updates into React `useState` (causes 60 re-renders/sec).
- ❌ Uncompressed 30MB 3D models or 4K uncompressed PNG textures.
- ❌ Loud autoplaying audio or hijacking native page scroll.

## Reference Map

| File | Read when |
|---|---|
| `references/art-direction.md` | Designing luxury automotive flagships, glassmorphic navbars, typography, and light rigs |
| `references/recipes.md` | Adding car paint configurators, contact shadows, wheel spin, and camera presets |
| `references/stack.md` | Setting up Next.js App Router with Three.js / R3F, React 19 compatibility, and SSR bypass |
| `references/performance.md` | Reviewing draw call budgets, texture compression, and mobile tiering |
| `references/qa-checklist.md` | Pre-delivery testing (leaks, fallbacks, throttled mobile performance) |
| `scripts/download-car-model.sh` | Fetching the production 1.6MB sports car GLB + contact shadow map |
| `scripts/scaffold-nextjs.sh` | Ingesting the luxury 3D showroom into a Next.js project |
| `scripts/optimize-model.sh` | Compressing heavy 3D GLBs with glTF-Transform |
