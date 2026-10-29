'use client';

import React from 'react';
import { CAR_COLORS, CarColorPreset, CameraViewPreset } from './CarCanvas';

interface ConfiguratorHUDProps {
  currentColor: CarColorPreset;
  onSelectColor: (c: CarColorPreset) => void;
  currentView: CameraViewPreset;
  onSelectView: (v: CameraViewPreset) => void;
}

export default function ConfiguratorHUD({
  currentColor,
  onSelectColor,
  currentView,
  onSelectView,
}: ConfiguratorHUDProps) {
  const views: { id: CameraViewPreset; label: string }[] = [
    { id: 'front', label: 'Front 3/4' },
    { id: 'side', label: 'Profile' },
    { id: 'rear', label: 'Aero Wing' },
    { id: 'top', label: 'Aero Top' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-black/70 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] pointer-events-auto">
      {/* Telemetry Quick Specs */}
      <div className="flex items-center gap-6 px-3">
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            0–100 KM/H
          </span>
          <span className="text-sm font-semibold tracking-wider text-white">1.74s</span>
        </div>
        <div className="w-[1px] h-6 bg-white/10" />
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            TOP SPEED
          </span>
          <span className="text-sm font-semibold tracking-wider text-white">412 KM/H</span>
        </div>
        <div className="w-[1px] h-6 bg-white/10" />
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            PEAK OUTPUT
          </span>
          <span className="text-sm font-semibold tracking-wider text-white">2,050 HP</span>
        </div>
      </div>

      {/* Camera View Switcher */}
      <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-full border border-white/5">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelectView(v.id)}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] font-medium transition-all duration-300 ${
              currentView === v.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Paint Swatches */}
      <div className="flex items-center gap-2.5 px-2">
        <span className="hidden lg:inline text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mr-1">
          LIVERY:
        </span>
        {CAR_COLORS.map((color) => {
          const isActive = currentColor.id === color.id;
          return (
            <button
              key={color.id}
              onClick={() => onSelectColor(color)}
              title={color.name}
              className={`relative w-6 h-6 rounded-full transition-transform duration-300 ${
                isActive ? 'scale-125 ring-2 ring-cyan-400 ring-offset-2 ring-offset-black' : 'hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full shadow-[0_0_10px_currentColor] text-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
