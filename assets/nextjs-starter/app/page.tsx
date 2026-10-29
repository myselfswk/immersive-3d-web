'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import ConfiguratorHUD from '../components/ConfiguratorHUD';
import { CAR_COLORS, CarColorPreset, CameraViewPreset } from '../components/CarCanvas';

// Dynamically import CarCanvas with SSR disabled to prevent hydration/window crashes
const CarCanvas = dynamic(() => import('../components/CarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#060709]">
      <div className="w-10 h-10 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin" />
    </div>
  ),
});

export default function Home() {
  const [currentColor, setCurrentColor] = useState<CarColorPreset>(CAR_COLORS[0]);
  const [currentView, setCurrentView] = useState<CameraViewPreset>('front');

  return (
    <main className="relative min-h-screen bg-[#060709] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Floating Awwwards-Tier Navbar */}
      <Navbar />

      {/* 3D WebGL Canvas Layer (Fixed Background Viewport) */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <CarCanvas currentColor={currentColor} currentView={currentView} />
      </div>

      {/* Hero Content Overlay (Editorial Luxury Automotive Layout) */}
      <section className="relative z-10 min-h-screen flex flex-col justify-between px-6 md:px-16 pt-32 pb-36 pointer-events-none">
        {/* Top Eyebrow & Headline */}
        <div className="max-w-2xl pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-950/20 backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-cyan-300">
              PROJECT APEX // HOMOLOGATION 01
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-extralight tracking-[-0.03em] uppercase leading-[0.95] mb-6">
            PURE GRAVITY.<br />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-cyan-400">
              ZERO DRAG.
            </span>
          </h1>

          <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed tracking-wide max-w-lg mb-8">
            Engineered with a solid-state 800V quantum battery architecture and an active aerodynamic carbon shell. Hand-crafted precision for the modern hyper-luxury collector.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#configurator"
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              Order Allocation
            </a>
            <button
              onClick={() => setCurrentView('side')}
              className="px-6 py-2.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:border-white/40 hover:bg-white/5"
            >
              Inspect Aero
            </button>
          </div>
        </div>

        {/* Right Corner Telemetry Node */}
        <div className="self-end text-right hidden md:block pointer-events-auto">
          <span className="block text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400/80 mb-1">
            AERODYNAMIC COEFFICIENT
          </span>
          <span className="text-3xl font-light tracking-tight text-white font-mono">
            0.198 <span className="text-xs text-zinc-400 font-sans">Cd</span>
          </span>
        </div>
      </section>

      {/* Interactive Configurator & View Switcher HUD */}
      <ConfiguratorHUD
        currentColor={currentColor}
        onSelectColor={setCurrentColor}
        currentView={currentView}
        onSelectView={setCurrentView}
      />
    </main>
  );
}
