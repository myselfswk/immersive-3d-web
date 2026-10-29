# immersive-3d-web (Antigravity Skill)

Build award-quality, luxury, buttery-smooth 3D websites with **Next.js App Router** (or Vite), Three.js, React Three Fiber, GSAP ScrollTrigger, Lenis smooth scroll, and PBR materials.

## Features
- **Next.js App Router as Primary Citizen**: Never overwrites existing projects; provides seamless client/server component architecture (`ssr: false` for WebGL, server components for SEO).
- **Awwwards-Caliber Automotive Showrooms**: Floating glassmorphic pill navbars, telemetry HUDs, live paint configurators, and studio 3-point lighting.
- **Production Asset Pipeline**:
  - `bash scripts/download-car-model.sh`: Downloads official 1.6MB multi-part sports car GLB + contact shadow map.
  - `bash scripts/scaffold-nextjs.sh`: Injects luxury 3D components directly into Next.js.
  - `bash scripts/optimize-model.sh`: 10x–50x GLB compression with glTF-Transform.
- **The 8 Unbreakable Laws**: Unified render loops, frame-rate-independent damping (`MathUtils.damp`), performance budgets, and strict bans on low-level AI clichés (no toy box cars, no raw rectangular navbars).

## Quick Start (Next.js)
```bash
# In your Next.js project root:
bash <path-to-skill>/scripts/scaffold-nextjs.sh .
npm run dev
```

## Quick Start (Vite Standalone)
```bash
bash <path-to-skill>/scripts/scaffold.sh ~/projects/my-3d-site
cd ~/projects/my-3d-site && npm run dev
```
