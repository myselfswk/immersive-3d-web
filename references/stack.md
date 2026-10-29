# Stack reference

## Contents
1. Primary Stack: Next.js App Router + Three.js
2. React 19 & Next.js Compatibility Guide
3. Next.js Luxury Showroom Architecture
4. React Three Fiber (R3F) Variant
5. Standalone Vite Variant
6. 3D Model Pipeline & Decoders
7. Build & Deploy Config

---

## 1. Primary Stack: Next.js App Router + Three.js

For modern web projects and production sites, **Next.js App Router (Next.js 15/16 + Tailwind CSS + Three.js + GSAP + Lenis)** is the primary, first-class citizen.

| Layer | Pick | Why |
|---|---|---|
| **Framework** | **Next.js App Router** | Full-stack power, server-side SEO preservation, image optimization |
| **Styling** | **Tailwind CSS (v4)** | Rapid, modern glassmorphic UI (`backdrop-blur-xl`, `border-white/10`) |
| **3D Engine** | **Three.js** | Industry standard, WebGL2/WebGPU support, complete control of render loop |
| **Animation** | **GSAP (ScrollTrigger)** | Camera lerping, timeline scrubbing, and DOM reveals |
| **Scroll Engine** | **Lenis** | Buttery smooth inertial scrolling that doesn't fight native scroll |
| **3D Asset Pipeline** | **GLB via Draco / KTX2** | Lightweight 1–2 MB multi-part models with PBR materials |

---

## 2. React 19 & Next.js Compatibility Guide

When working with Next.js 15/16 and React 19:

### The Two 3D Integration Strategies in Next.js:

#### Strategy A: Direct Three.js Canvas in Client Component (Recommended for locked 60fps & React 19)
- **Why**: React 19 has breaking changes that sometimes cause peer-dependency warnings with older R3F packages. Wrapping a Three.js canvas inside a Next.js `'use client'` component (`components/CarCanvas.tsx`) gives you:
  - 100% immunity to React version mismatches.
  - Zero React reconciliation overhead during 60 FPS animations.
  - Direct access to `renderer.toneMapping`, custom GLSL, and GSAP tickers.
- **SSR Isolation**:
  Always import dynamically in your server page:
  ```tsx
  // app/page.tsx
  import dynamic from 'next/dynamic';
  const CarCanvas = dynamic(() => import('@/components/CarCanvas'), { ssr: false });
  ```

#### Strategy B: React Three Fiber (R3F v9)
- If you prefer declarative JSX components (`<Canvas>`, `<mesh>`, `<Environment>`):
  - With React 19, you **MUST** install `@react-three/fiber@^9.0.0` or `@react-three/fiber@rc`.
  - Install `@react-three/drei` and `@react-three/postprocessing`.
  - Do **not** store high-frequency scroll or mouse coordinates in React `useState`. Use mutable refs or external stores (`zustand`) read inside `useFrame`.

---

## 3. Next.js Luxury Showroom Architecture

Matches `assets/nextjs-starter/`:

```
app/
├── layout.tsx         # Global dark theme (#060709), font preloading, metadata
└── page.tsx           # Server component: editorial layout, specs, dynamic 3D import
components/
├── Navbar.tsx         # Floating glassmorphic pill header (Awwwards standard)
├── CarCanvas.tsx      # Client 3D engine: studio lighting, GLTF loader, PBR paint, camera rails
└── ConfiguratorHUD.tsx # Interactive paint swatches (Obsidian, Cyan, Titanium) + camera presets
public/
├── models/
│   ├── car.glb        # Optimized sports car GLB (downloaded with download-car-model.sh)
│   └── car_ao.png     # Contact shadow map
└── draco/             # Offline Draco decoders
```

### Safety Rule for Agents:
**NEVER run `scripts/scaffold.sh` on an existing Next.js project.** Running `scaffold.sh` wipes out Next.js configurations. For Next.js projects, always run `scripts/scaffold-nextjs.sh <project-dir>` or inject the components directly.

---

## 4. Standalone Vite Variant

Only use Vite if:
1. The user explicitly requests a standalone vanilla Vite project with no framework.
2. Building a self-contained single-page marketing microsite without React.

Scaffold with: `bash scripts/scaffold.sh <target-dir>` (uses `assets/starter/`).

---

## 5. 3D Model Pipeline & Decoders

### Instant Production Automotive Model
Run:
```bash
bash scripts/download-car-model.sh public
```
This fetches the official Three.js high-poly, lightweight (1.68 MB) Ferrari sports car GLB with named parts (`body`, `rims`, `trim`, `glass`, `wheels`) and contact shadow texture directly into `public/models/`.

### Custom Artist Models
Compress with glTF-Transform:
```bash
bash scripts/optimize-model.sh input.glb public/models/hero.glb
```
Applies mesh welding, pruning, deduplication, WebP/KTX2 texture compression, and Meshopt geometry quantization.

---

## 6. Build & Deploy Config

Next.js Turbopack / Webpack config for large 3D assets and shaders:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow importing .glsl files if needed
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    return config;
  },
};

export default nextConfig;
```
