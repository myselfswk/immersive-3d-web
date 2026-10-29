'use client';

import React from 'react';
import { sound } from './AudioController';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FullscreenMenu({ isOpen, onClose }: FullscreenMenuProps) {
  if (!isOpen) return null;

  const links = [
    { num: '01', label: 'Overview', href: '#top' },
    { num: '02', label: 'Philosophy', href: '#story' },
    { num: '03', label: '3D Spatial Inspector', href: '#inspector' },
    { num: '04', label: 'Telemetry & Specs', href: '#specs' },
    { num: '05', label: 'Timeline & Archive', href: '#archive' },
    { num: '06', label: 'Dispatch / Contact', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    sound.playSwoosh();
    onClose();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-8 md:p-16 bg-[#060709]/95 backdrop-blur-3xl border border-white/10 animate-fade-in text-white select-none">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-400">
            INDEX DIRECTORY
          </span>
        </div>
        <button
          onClick={() => {
            sound.playTick();
            onClose();
          }}
          className="group flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-[0.2em] transition-all"
        >
          <span>CLOSE</span>
          <span className="text-sm transition-transform duration-300 group-hover:rotate-90">✕</span>
        </button>
      </div>

      {/* Main Nav Links (Kinetic Typography) */}
      <nav className="flex flex-col gap-3 my-auto max-w-4xl">
        {links.map((link) => (
          <a
            key={link.num}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(link.href);
            }}
            onMouseEnter={() => sound.playTick()}
            className="group flex items-baseline gap-6 text-3xl sm:text-5xl md:text-7xl font-extralight uppercase tracking-tight text-zinc-400 hover:text-white transition-all duration-300"
          >
            <span className="text-xs sm:text-sm font-mono text-cyan-400 tracking-[0.25em] opacity-60 group-hover:opacity-100">
              {link.num}
            </span>
            <span className="relative overflow-hidden">
              <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-3">
                {link.label}
              </span>
            </span>
            <span className="text-xs opacity-0 transform -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-cyan-400 font-mono">
              [DISPATCH] ↗
            </span>
          </a>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs font-mono text-zinc-400 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
            X / Twitter
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
            Instagram
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
            GitHub
          </a>
        </div>
        <span>BUILT WITH THREE.JS & NEXT.JS</span>
      </div>
    </div>
  );
}
