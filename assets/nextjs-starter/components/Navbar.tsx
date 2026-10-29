'use client';

import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onInquire?: () => void;
}

export default function Navbar({ onInquire }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 py-5 pointer-events-none transition-all duration-300">
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-8 md:gap-14 px-6 py-3 rounded-full border transition-all duration-500 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-2xl border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
            : 'bg-black/40 backdrop-blur-md border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Brand Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
          <a
            href="#top"
            className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-white hover:text-cyan-300 transition-colors"
          >
            AETHELON
          </a>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#architecture"
            className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 hover:text-white transition-colors"
          >
            Architecture
          </a>
          <a
            href="#powertrain"
            className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 hover:text-white transition-colors"
          >
            Powertrain
          </a>
          <a
            href="#configurator"
            className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 hover:text-white transition-colors"
          >
            Bespoke Atelier
          </a>
          <a
            href="#specs"
            className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 hover:text-white transition-colors"
          >
            Telemetry
          </a>
        </div>

        {/* Telemetry Status & CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 border-r border-white/10 pr-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              800V ARCHITECTURE
            </span>
          </div>

          <a
            href="#configurator"
            onClick={onInquire}
            className="group relative inline-flex items-center justify-center px-4 py-1.5 overflow-hidden rounded-full border border-cyan-400/40 bg-cyan-950/20 text-cyan-300 text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>Commission</span>
              <span className="transform transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
