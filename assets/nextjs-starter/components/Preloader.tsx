'use client';

import React, { useState, useEffect } from 'react';
import { sound } from './AudioController';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);
  const [unmounted, setUnmounted] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 3;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        clearInterval(interval);
        setReady(true);
      } else {
        setPercent(current);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = (withSound: boolean) => {
    if (withSound) {
      sound.toggle();
    }
    sound.playSwoosh();
    setIsDismissing(true);
    setTimeout(() => {
      onComplete();
      setUnmounted(true);
    }, 900);
  };

  if (unmounted) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex flex-col items-center justify-between overflow-hidden">
      {/* Top Curtain */}
      <div
        className={`absolute top-0 left-0 w-full h-1/2 bg-[#060709] border-b border-white/10 transition-transform duration-800 ease-[cubic-bezier(0.85,0,0.15,1)] z-10 ${
          isDismissing ? '-translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* Bottom Curtain */}
      <div
        className={`absolute bottom-0 left-0 w-full h-1/2 bg-[#060709] border-t border-white/10 transition-transform duration-800 ease-[cubic-bezier(0.85,0,0.15,1)] z-10 ${
          isDismissing ? 'translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* Content Layer */}
      <div
        className={`relative z-20 w-full h-full flex flex-col justify-between p-8 md:p-14 select-none transition-opacity duration-500 ${
          isDismissing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-ping" />
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400">
              STUDIO 3D // CALIBRATING KINEMATICS
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 hidden md:inline">
            AESTHETIC V3.8 // LOCKED 60FPS
          </span>
        </div>

        {/* Center Percentage Display */}
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="relative flex items-baseline">
            <span className="text-7xl md:text-9xl font-extralight tracking-tighter text-white font-mono">
              {percent < 10 ? `0${percent}` : percent}
            </span>
            <span className="text-xl md:text-3xl font-light text-cyan-400 font-mono ml-2">%</span>
          </div>

          <div className="w-48 md:w-64 h-[1px] bg-white/10 mt-6 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-100 shadow-[0_0_12px_#22d3ee]"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-8 text-center">
            {ready ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
                <button
                  onClick={() => handleEnter(true)}
                  className="px-8 py-3 rounded-full bg-cyan-400 text-black text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95"
                >
                  Enter with Audio 🔊
                </button>
                <button
                  onClick={() => handleEnter(false)}
                  className="px-6 py-3 rounded-full border border-white/20 text-zinc-400 text-xs font-medium uppercase tracking-[0.25em] hover:text-white hover:border-white/50 transition-colors"
                >
                  Mute Intro
                </button>
              </div>
            ) : (
              <p className="text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400 animate-pulse">
                INITIALIZING SPATIAL BUFFERS & SHADERS...
              </p>
            )}
          </div>
        </div>

        {/* Bottom Status */}
        <div className="flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400">
          <span>GLTF PIPELINE READY</span>
          <span>© 2026 INTERACTIVE STUDIO</span>
        </div>
      </div>
    </div>
  );
}
