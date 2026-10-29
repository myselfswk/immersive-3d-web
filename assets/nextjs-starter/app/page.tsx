'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Preloader from '../components/Preloader';
import Navbar from '../components/Navbar';
import FullscreenMenu from '../components/FullscreenMenu';
import { RenderMode } from '../components/SceneCanvas';
import { sound } from '../components/AudioController';

// Dynamically import SceneCanvas with SSR disabled to guarantee zero hydration/window errors
const SceneCanvas = dynamic(() => import('../components/SceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#060709]">
      <div className="w-12 h-12 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin" />
    </div>
  ),
});

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renderMode, setRenderMode] = useState<RenderMode>('pbr');
  const [activeHotspot, setActiveHotspot] = useState<{ id: string; label: string; detail: string } | null>(null);

  const switchMode = (mode: RenderMode) => {
    sound.playTick();
    setRenderMode(mode);
  };

  return (
    <main className="relative min-h-screen bg-[#060709] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Cinematic Splash Screen / Preloader */}
      <Preloader onComplete={() => sound.playSwoosh()} />

      {/* 2. Fullscreen Kinetic Menu Overlay */}
      <FullscreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* 3. Floating Navbar */}
      <Navbar onOpenMenu={() => setMenuOpen(true)} />

      {/* 4. Global 3D WebGL Canvas (Fixed Background Viewport) */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <SceneCanvas
          renderMode={renderMode}
          onActiveHotspot={(h) => {
            sound.playTick();
            setActiveHotspot(h);
          }}
        />
      </div>

      {/* =========================================================================
          MULTI-SECTION NARRATIVE ARCHITECTURE (Real Semantic DOM for SEO)
         ========================================================================= */}
      <div className="relative z-10 pointer-events-none">

        {/* -----------------------------------------------------------------------
            SECTION 1: HERO (Beat 0)
           ----------------------------------------------------------------------- */}
        <section
          id="top"
          className="min-h-screen flex flex-col justify-between px-6 md:px-16 pt-36 pb-16 pointer-events-none"
        >
          <div className="max-w-3xl pointer-events-auto">
            {/* Telemetry Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-cyan-400/25 bg-cyan-950/25 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-cyan-300">
                SERIES 2026 // SPATIAL FLAGSHIP
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-extralight tracking-[-0.04em] uppercase leading-[0.92] mb-8">
              BEYOND SPEED.<br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-cyan-400">
                PURE GRAVITY.
              </span>
            </h1>

            {/* Editorial Copy */}
            <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed tracking-wide max-w-xl mb-10">
              An award-winning interactive spatial showcase engineered for absolute performance. Seamlessly fusing quantum telemetry, custom GLSL shaders, and buttery-smooth scroll choreography.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#inspector"
                onClick={() => sound.playSwoosh()}
                className="px-8 py-3.5 rounded-full bg-cyan-400 text-black text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95"
              >
                Inspect 3D Stage
              </a>
              <a
                href="#story"
                onClick={() => sound.playTick()}
                className="px-6 py-3.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white text-xs uppercase tracking-[0.22em] font-medium transition-all hover:border-white/40 hover:bg-white/5"
              >
                The Manifesto ↓
              </a>
            </div>
          </div>

          {/* Bottom Telemetry Ticker & Scroll Indicator */}
          <div className="flex items-end justify-between w-full pt-12 border-t border-white/10 pointer-events-auto">
            <div className="flex items-center gap-8">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                  REFRESH RATE
                </span>
                <span className="text-sm font-mono font-semibold text-white">LOCKED 60 FPS</span>
              </div>
              <div className="hidden sm:block w-[1px] h-6 bg-white/10" />
              <div className="hidden sm:block">
                <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                  SHADING BACKEND
                </span>
                <span className="text-sm font-mono font-semibold text-cyan-400">WEBGL2 // PBR</span>
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400 animate-pulse">
              SCROLL TO EXPLORE ▾
            </span>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 2: MANIFESTO / PHILOSOPHY (Beat 1)
           ----------------------------------------------------------------------- */}
        <section
          id="story"
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-32 pointer-events-none"
        >
          <div className="max-w-4xl pointer-events-auto bg-black/60 backdrop-blur-2xl p-8 md:p-14 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400">
                02 // THE PHILOSOPHY
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-tight leading-[1.05] mb-8 text-white">
              &ldquo;WE DON&rsquo;T SIMPLY MODEL FORMS.<br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                WE CHOREOGRAPH LIGHT, WEIGHT & KINEMATICS.&rdquo;
              </span>
            </h2>

            <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed max-w-2xl mb-8">
              Inspired by elite motorsport engineering and digital luxury flagships, every polygon is justified by aerodynamic purpose. Smoothness is not an afterthought—it is the signature product.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 font-mono text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">AERODYNAMICS</span>
                <span className="text-white font-medium text-sm">ACTIVE MATRIX</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">STRUCTURE</span>
                <span className="text-white font-medium text-sm">CARBON MONOCOQUE</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">TOLERANCES</span>
                <span className="text-cyan-400 font-medium text-sm">SUB-MILLIMETER</span>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 3: 3D INTERACTIVE STAGE & INSPECTOR (Beat 2)
           ----------------------------------------------------------------------- */}
        <section
          id="inspector"
          className="min-h-screen flex flex-col justify-between px-6 md:px-16 py-28 pointer-events-none"
        >
          {/* Top Stage Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-auto">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 block mb-1">
                03 // 3D SPATIAL INSPECTOR
              </span>
              <h3 className="text-2xl md:text-4xl font-light uppercase tracking-tight">
                DIRECT INERTIAL STAGE
              </h3>
            </div>

            {/* Shading Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-xl">
              {(['pbr', 'wireframe', 'hologram'] as RenderMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => switchMode(mode)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.2em] transition-all duration-300 ${
                    renderMode === mode
                      ? 'bg-cyan-400 text-black font-semibold shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Active Hotspot Drawer (if clicked) */}
          {activeHotspot && (
            <div className="self-center pointer-events-auto max-w-md p-6 rounded-2xl bg-black/90 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.25)] animate-fade-in my-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  {activeHotspot.label}
                </span>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-zinc-400 hover:text-white text-xs font-mono"
                >
                  [DISMISS]
                </button>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                {activeHotspot.detail}
              </p>
            </div>
          )}

          {/* Bottom Hotspots Helper */}
          <div className="pointer-events-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-zinc-400">
            <span>CLICK HOTSPOTS FOR DEEP TELEMETRY</span>
            <span>ROTATION DRAG ENABLED</span>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 4: TELEMETRY BENTO GRID (Beat 3)
           ----------------------------------------------------------------------- */}
        <section
          id="specs"
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-28 pointer-events-none"
        >
          <div className="max-w-6xl w-full mx-auto pointer-events-auto">
            <div className="mb-12">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 block mb-2">
                04 // PERFORMANCE TELEMETRY
              </span>
              <h3 className="text-3xl md:text-6xl font-light uppercase tracking-tight">
                PRECISION BENCHMARKS
              </h3>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-4">
                  ACCELERATION
                </span>
                <span className="text-4xl md:text-5xl font-extralight text-white font-mono block mb-2 group-hover:text-cyan-300 transition-colors">
                  1.74<span className="text-lg font-sans text-cyan-400">s</span>
                </span>
                <p className="text-xs text-zinc-400 font-light">
                  0–100 km/h sprint under launch control with all-wheel torque vectoring.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-4">
                  VELOCITY MAX
                </span>
                <span className="text-4xl md:text-5xl font-extralight text-white font-mono block mb-2 group-hover:text-cyan-300 transition-colors">
                  412<span className="text-lg font-sans text-cyan-400">km/h</span>
                </span>
                <p className="text-xs text-zinc-400 font-light">
                  Aerodynamic low-drag top speed homologation achieved with active air braking.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-4">
                  PEAK POWER
                </span>
                <span className="text-4xl md:text-5xl font-extralight text-white font-mono block mb-2 group-hover:text-cyan-300 transition-colors">
                  2,050<span className="text-lg font-sans text-cyan-400">HP</span>
                </span>
                <p className="text-xs text-zinc-400 font-light">
                  Quad permanent-magnet synchronous motors generating 2,360 Nm torque.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-4">
                  DRAG COEFFICIENT
                </span>
                <span className="text-4xl md:text-5xl font-extralight text-white font-mono block mb-2 group-hover:text-cyan-300 transition-colors">
                  0.198<span className="text-lg font-sans text-cyan-400">Cd</span>
                </span>
                <p className="text-xs text-zinc-400 font-light">
                  Wind-tunnel tested carbon monocoque with underbody Venturi tunnels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 5: ARCHIVE & TIMELINE (Beat 4)
           ----------------------------------------------------------------------- */}
        <section
          id="archive"
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-28 pointer-events-none"
        >
          <div className="max-w-5xl w-full mx-auto pointer-events-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 block mb-2">
                  05 // CHRONOLOGY & ACHIEVEMENTS
                </span>
                <h3 className="text-3xl md:text-5xl font-light uppercase tracking-tight">
                  THE ARCHIVE
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest hidden sm:inline">
                2024 — 2026
              </span>
            </div>

            {/* Timeline Rows */}
            <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
              <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/5 px-4 transition-colors rounded-xl">
                <span className="text-xs font-mono text-cyan-400 tracking-wider">PHASE 01 // 2024</span>
                <h4 className="text-xl md:text-2xl font-light uppercase">Carbon Aerodynamic Homologation</h4>
                <span className="text-xs font-mono text-zinc-400">[VALIDATED]</span>
              </div>
              <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/5 px-4 transition-colors rounded-xl">
                <span className="text-xs font-mono text-cyan-400 tracking-wider">PHASE 02 // 2025</span>
                <h4 className="text-xl md:text-2xl font-light uppercase">800V Solid-State Track Supremacy</h4>
                <span className="text-xs font-mono text-zinc-400">[RECORD 6:05.3]</span>
              </div>
              <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/5 px-4 transition-colors rounded-xl">
                <span className="text-xs font-mono text-cyan-400 tracking-wider">PHASE 03 // 2026</span>
                <h4 className="text-xl md:text-2xl font-light uppercase">Bespoke Atelier Commissioning Release</h4>
                <span className="text-xs font-mono text-emerald-400 animate-pulse">[LIVE NOW]</span>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 6: CONTACT & OUTRO FINALE (Beat 5)
           ----------------------------------------------------------------------- */}
        <section
          id="contact"
          className="min-h-screen flex flex-col justify-between px-6 md:px-16 pt-32 pb-16 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto text-center pointer-events-auto my-auto">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 block mb-6">
              06 // INITIATE DISPATCH
            </span>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-extralight uppercase tracking-tight leading-[0.95] mb-8">
              STEP INTO THE<br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                NEXT ERA.
              </span>
            </h2>
            <p className="text-sm md:text-base text-zinc-400 font-light max-w-xl mx-auto mb-10">
              Inquire regarding bespoke commissions, 3D architectural collaborations, or custom spatial implementations.
            </p>

            <a
              href="mailto:inquire@studio3d.com"
              onClick={() => sound.playSwoosh()}
              className="inline-block px-10 py-4 rounded-full bg-cyan-400 text-black text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95"
            >
              Inquire Allocation ↗
            </a>
          </div>

          {/* Minimalist Footer */}
          <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-xs font-mono text-zinc-400 pointer-events-auto">
            <span>© 2026 AETHELON INTERACTIVE // ALL RIGHTS RESERVED</span>
            <div className="flex items-center gap-6">
              <a href="#top" onClick={() => sound.playTick()} className="hover:text-white transition-colors">BACK TO TOP ↑</a>
              <span>AWWWARDS SOTD CALIBER</span>
            </div>
          </footer>
        </section>

      </div>
    </main>
  );
}
