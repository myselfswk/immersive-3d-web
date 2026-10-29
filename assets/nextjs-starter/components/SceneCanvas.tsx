'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export type RenderMode = 'pbr' | 'wireframe' | 'hologram';

interface HotspotData {
  id: string;
  pos?: THREE.Vector3;
  label: string;
  detail: string;
}

interface SceneCanvasProps {
  renderMode?: RenderMode;
  onActiveHotspot?: (hotspot: HotspotData | null) => void;
}

export default function SceneCanvas({
  renderMode = 'pbr',
  onActiveHotspot,
}: SceneCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const [screenHotspots, setScreenHotspots] = useState<{ id: string; x: number; y: number; label: string; detail: string; visible: boolean }[]>([]);
  const [isInteractiveStage, setIsInteractiveStage] = useState(false);

  // Hotspots in 3D local coordinates
  const hotspotsData: HotspotData[] = [
    {
      id: 'aero',
      pos: new THREE.Vector3(0.8, 0.6, 0.9),
      label: 'Aero Intake // 01',
      detail: 'Ultra-light carbon fiber active aerodynamic flow channels reducing boundary drag by 38%.',
    },
    {
      id: 'core',
      pos: new THREE.Vector3(0.0, 0.2, 0.0),
      label: 'Solid-State Core // 02',
      detail: 'Quantum 800V solid-state architecture delivering instantaneous 2,050 HP with zero thermal lag.',
    },
    {
      id: 'optics',
      pos: new THREE.Vector3(-0.7, 0.4, 1.2),
      label: 'LiDAR Guidance // 03',
      detail: 'Sub-millimeter spatial telemetric scanning pulsing at 120Hz for extreme telemetry precision.',
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060709');
    scene.fog = new THREE.FogExp2('#060709', 0.04);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.5, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // --- Lighting Rig (Studio 3-Point + Colored Rim Highlights) ---
    const ambientLight = new THREE.AmbientLight('#0f172a', 1.8);
    scene.add(ambientLight);

    const topSoftbox = new THREE.DirectionalLight('#ffffff', 3.0);
    topSoftbox.position.set(0, 8, 3);
    scene.add(topSoftbox);

    const keyLight = new THREE.DirectionalLight('#e0f2fe', 2.2);
    keyLight.position.set(5, 3, 5);
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight('#00f0ff', 4.0);
    cyanRim.position.set(-6, 2, -4);
    scene.add(cyanRim);

    const goldAccent = new THREE.DirectionalLight('#f59e0b', 1.5);
    goldAccent.position.set(4, -2, -3);
    scene.add(goldAccent);

    // --- Ground Grid & Contact Shadow ---
    const grid = new THREE.GridHelper(30, 40, '#00f0ff', '#131b26');
    grid.position.y = -1.2;
    (grid.material as THREE.Material).opacity = 0.18;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // Contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(3.5, 5.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.6,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.19;
    scene.add(shadowMesh);

    // --- Central Hero Stage Group ---
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Shared materials tracker
    materialsRef.current = [];

    // --- High-Tech Procedural Kinetic Core / Cyber Artifact ---
    // (Used as immediate stunning visual; auto-swaps if GLB is loaded)
    const artifactGroup = new THREE.Group();
    heroGroup.add(artifactGroup);

    // 1. Aerodynamic Outer Kinetic Shell (Iridescent PBR)
    const shellGeo = new THREE.IcosahedronGeometry(1.2, 3);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0b0e14'),
      metalness: 0.95,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.9,
    });
    materialsRef.current.push(shellMat);
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    artifactGroup.add(shellMesh);

    // 2. Gimbal Orbit Rings
    const ringGeo = new THREE.TorusGeometry(1.6, 0.02, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#00f0ff',
      emissive: '#00e5ff',
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.2,
    });
    materialsRef.current.push(ringMat);
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    artifactGroup.add(ring1);
    artifactGroup.add(ring2);

    // 3. Glowing Inner Quantum Core
    const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#00f0ff',
      emissive: '#00f0ff',
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });
    materialsRef.current.push(coreMat);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    artifactGroup.add(coreMesh);

    // 4. Ambient Floating Dust / Kinetic Particle Streams
    const particleCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#38bdf8',
      size: 0.035,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- Optional GLB Loader ---
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    // Auto-detect and swap if user has /models/hero.glb or /models/car.glb
    const candidatePaths = ['/models/hero.glb', '/models/car.glb'];
    const tryLoadGlb = (idx: number) => {
      if (idx >= candidatePaths.length) return;
      loader.load(
        candidatePaths[idx],
        (gltf) => {
          artifactGroup.visible = false;
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          model.position.y += 0.2;
          heroGroup.add(model);
        },
        undefined,
        () => tryLoadGlb(idx + 1)
      );
    };
    tryLoadGlb(0);

    // --- Camera Rail Keyframes Across Scroll Beats ---
    const cameraRails = [
      { pos: new THREE.Vector3(0, 0.4, 6.2), look: new THREE.Vector3(0, 0, 0) },      // Beat 0: Hero Front
      { pos: new THREE.Vector3(2.4, 0.9, 4.0), look: new THREE.Vector3(0, 0.2, 0) },    // Beat 1: Story / Manifesto
      { pos: new THREE.Vector3(0.0, 0.5, 4.5), look: new THREE.Vector3(0, 0.2, 0) },    // Beat 2: 3D Stage Inspector
      { pos: new THREE.Vector3(-2.8, 1.8, 5.0), look: new THREE.Vector3(0, -0.2, 0) },  // Beat 3: Telemetry Bento
      { pos: new THREE.Vector3(0, 0.2, 8.0), look: new THREE.Vector3(0, 0, 0) },        // Beat 4: Outro Finale
    ];

    // --- Pointer & Drag Inertia ---
    let pointerX = 0;
    let pointerY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let targetDragRotY = 0;
    let targetDragRotX = 0;
    let currentDragRotY = 0;
    let currentDragRotX = 0;

    const onPointerMove = (e: MouseEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        targetDragRotY += dx * 0.007;
        targetDragRotX += dy * 0.007;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // Only drag if in interactive stage section
      const inspectorElem = document.getElementById('inspector');
      if (inspectorElem) {
        const rect = inspectorElem.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
          isDragging = true;
          dragStartX = e.clientX;
          dragStartY = e.clientY;
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // --- Animation & Render Loop ---
    let reqId: number;
    let prevTime = performance.now();
    const currentCamPos = camera.position.clone();
    const currentLookAt = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      // Calculate global scroll progress (0..1)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      const rawProgress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

      // Determine active rail beat index (0 to 4)
      const beatFloat = rawProgress * (cameraRails.length - 1);
      const beatIdx = Math.floor(beatFloat);
      const beatNext = Math.min(beatIdx + 1, cameraRails.length - 1);
      const beatFrac = beatFloat - beatIdx;

      // Check if user is currently scrolled to the 3D Stage Inspector section
      const inspectorElem = document.getElementById('inspector');
      if (inspectorElem) {
        const rect = inspectorElem.getBoundingClientRect();
        setIsInteractiveStage(rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5);
      }

      // Interpolate Camera Keyframes
      const railA = cameraRails[beatIdx];
      const railB = cameraRails[beatNext];
      const targetPos = new THREE.Vector3().lerpVectors(railA.pos, railB.pos, beatFrac);
      const targetLook = new THREE.Vector3().lerpVectors(railA.look, railB.look, beatFrac);

      // Add Subtle Desktop Parallax
      targetPos.x += pointerX * 0.35;
      targetPos.y += -pointerY * 0.25;

      // Frame-rate independent camera damping
      currentCamPos.x = THREE.MathUtils.damp(currentCamPos.x, targetPos.x, 4.5, dt);
      currentCamPos.y = THREE.MathUtils.damp(currentCamPos.y, targetPos.y, 4.5, dt);
      currentCamPos.z = THREE.MathUtils.damp(currentCamPos.z, targetPos.z, 4.5, dt);
      camera.position.copy(currentCamPos);

      currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, targetLook.x, 5, dt);
      currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, targetLook.y, 5, dt);
      currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, targetLook.z, 5, dt);
      camera.lookAt(currentLookAt);

      // Interactive Drag Rotation
      currentDragRotY = THREE.MathUtils.damp(currentDragRotY, targetDragRotY, 7, dt);
      currentDragRotX = THREE.MathUtils.damp(currentDragRotX, targetDragRotX, 7, dt);

      // Idle Rotation + Drag Rotation
      const idleTime = now * 0.0005;
      artifactGroup.rotation.y = idleTime * 0.5 + currentDragRotY;
      artifactGroup.rotation.x = currentDragRotX;
      ring1.rotation.y = idleTime * 1.2;
      ring1.rotation.z = idleTime * 0.8;
      ring2.rotation.x = idleTime * 0.9;

      // Project Hotspots to 2D Screen Space
      const projected = hotspotsData.map((h) => {
        const localPos = h.pos || new THREE.Vector3();
        const worldPos = localPos.clone().applyMatrix4(artifactGroup.matrixWorld);
        const screenPos = worldPos.clone().project(camera);
        const x = ((screenPos.x + 1) * container.clientWidth) / 2;
        const y = ((-screenPos.y + 1) * container.clientHeight) / 2;
        const visible = screenPos.z < 1.0;
        return {
          id: h.id,
          x,
          y,
          label: h.label,
          detail: h.detail,
          visible,
        };
      });
      setScreenHotspots(projected);

      renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight, false);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle Render Mode Switch (PBR vs Wireframe vs Hologram)
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      if ('wireframe' in mat) {
        mat.wireframe = renderMode === 'wireframe';
      }
      if (renderMode === 'hologram' && 'opacity' in mat) {
        mat.transparent = true;
        mat.opacity = 0.5;
      }
    });
  }, [renderMode]);

  return (
    <div className="relative w-full h-full select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Interactive Drag Cursor Hint */}
      {isInteractiveStage && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/30 backdrop-blur-md animate-bounce">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-cyan-300">
            DRAG TO INSPECT 3D ORIENTATION ⟲
          </span>
        </div>
      )}

      {/* 3D Coordinate-Projected Hotspot Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {screenHotspots.map((h) => {
          if (!h.visible) return null;
          return (
            <div
              key={h.id}
              style={{
                transform: `translate3d(${h.x}px, ${h.y}px, 0)`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
              onClick={() => onActiveHotspot && onActiveHotspot(h)}
            >
              {/* Pulsing Target Dot */}
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-ping opacity-75" />
                <span className="absolute w-2 h-2 rounded-full bg-white" />
              </div>

              {/* Hover Badge */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col gap-1 w-64 p-3 rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-30 animate-fade-in pointer-events-none">
                <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">
                  {h.label}
                </span>
                <span className="text-xs text-zinc-300 leading-snug">
                  {h.detail}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
