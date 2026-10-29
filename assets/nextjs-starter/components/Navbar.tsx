'use client';

import React, { useState, useEffect } from 'react';
import { sound } from './AudioController';

interface NavbarProps {
  onOpenMenu: () => void;
  activeSection?: string;
}

export default function Navbar({ onOpenMenu, activeSection = '01' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const state = sound.toggle();
    setAudioEnabled(state);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-center px-4 py-5 pointer-events-none transition-all duration-300">
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-6 md:gap-12 px-6 py-3 rounded-full border transition-all duration-500 ${
          scrolled
            ? 'bg-black/85 backdrop-blur-2xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
            : 'bg-black/45 backdrop-blur-md border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Brand Monogram */}
        <a
          href="#top"
          onClick={() => sound.playTick()}
          className="flex items-center gap-3 group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] transition-transform duration-300 group-hover:scale-125" />
          <span className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-white group-hover:text-cyan-300 transition-colors">
            AETHELON
          </span>
        </a>

        {/* Desktop Anchor Links */}
        <div className="hidden lg:flex items-center gap-8">
          <a
            href="#story"
            onClick={() => sound.playTick()}
            className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 hover:text-white transition-colors"
          >
            Narrative
          </a>
          <a
            href="#inspector"
            onClick={() => sound.playTick()}
            className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 hover:text-white transition-colors"
          >
            3D Stage
          </a>
          <a
            href="#specs"
            onClick={() => sound.playTick()}
            className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 hover:text-white transition-colors"
          >
            Telemetry
          </a>
          <a
            href="#archive"
            onClick={() => sound.playTick()}
            className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 hover:text-white transition-colors"
          >
            Archive
          </a>
        </div>

        {/* Telemetry Counter & Actions */}
        <div className="flex items-center gap-3">
          {/* Section Indicator */}
          <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            BEAT // {activeSection}
          </span>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="w-8 h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-zinc-400 hover:text-white transition-all"
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>

          {/* Fullscreen Menu Trigger */}
          <button
            onClick={() => {
              sound.playSwoosh();
              onOpenMenu();
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/20 text-cyan-300 text-[11px] uppercase tracking-[0.2em] font-medium transition-all hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
