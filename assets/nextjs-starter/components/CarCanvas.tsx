'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface CarColorPreset {
  id: string;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
}

export const CAR_COLORS: CarColorPreset[] = [
  { id: 'obsidian', name: 'Obsidian Black', hex: '#0a0d12', metalness: 0.95, roughness: 0.12, clearcoat: 1.0 },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#00f0ff', metalness: 0.88, roughness: 0.18, clearcoat: 1.0 },
  { id: 'titanium', name: 'Liquid Titanium', hex: '#cfd6df', metalness: 0.98, roughness: 0.15, clearcoat: 1.0 },
  { id: 'crimson', name: 'Apex Crimson', hex: '#b3001e', metalness: 0.92, roughness: 0.14, clearcoat: 1.0 },
];

export type CameraViewPreset = 'front' | 'side' | 'rear' | 'top';

interface CarCanvasProps {
  currentColor?: CarColorPreset;
  currentView?: CameraViewPreset;
}

export default function CarCanvas({
  currentColor = CAR_COLORS[0],
  currentView = 'front',
}: CarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(3.2, 1.4, 4.2));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 0));
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Update paint color dynamically
  useEffect(() => {
    if (bodyMatRef.current) {
      bodyMatRef.current.color.set(currentColor.hex);
      bodyMatRef.current.metalness = currentColor.metalness;
      bodyMatRef.current.roughness = currentColor.roughness;
      bodyMatRef.current.clearcoat = currentColor.clearcoat;
    }
  }, [currentColor]);

  // Update camera target based on view preset
  useEffect(() => {
    switch (currentView) {
      case 'front':
        targetCamPosRef.current.set(3.2, 1.3, 4.2);
        targetLookAtRef.current.set(0, 0.4, 0);
        break;
      case 'side':
        targetCamPosRef.current.set(5.2, 1.1, 0.2);
        targetLookAtRef.current.set(0, 0.5, 0);
        break;
      case 'rear':
        targetCamPosRef.current.set(-2.8, 1.4, -4.4);
        targetLookAtRef.current.set(0, 0.5, -0.4);
        break;
      case 'top':
        targetCamPosRef.current.set(0.01, 7.5, 0.1);
        targetLookAtRef.current.set(0, 0, 0);
        break;
    }
  }, [currentView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene & Renderer Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060709');
    scene.fog = new THREE.FogExp2('#060709', 0.05);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(3.2, 1.4, 4.2);

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

    // --- Lighting Rig (Studio 3-Point + Rims) ---
    const ambientLight = new THREE.AmbientLight('#141c28', 1.8);
    scene.add(ambientLight);

    // Overhead Key Softbox
    const topKey = new THREE.DirectionalLight('#ffffff', 3.2);
    topKey.position.set(0, 8, 2);
    scene.add(topKey);

    // Front-Quarter Warm Key
    const frontKey = new THREE.DirectionalLight('#eef5ff', 2.5);
    frontKey.position.set(4, 3, 5);
    scene.add(frontKey);

    // Cyan Rim Light (aerodynamic silhouette accents)
    const rimCyan = new THREE.DirectionalLight('#00f0ff', 3.8);
    rimCyan.position.set(-6, 2.5, -4);
    scene.add(rimCyan);

    // Subtle Underglow
    const underglow = new THREE.PointLight('#00e5ff', 2.0, 6, 2.0);
    underglow.position.set(0, 0.1, 0);
    scene.add(underglow);

    // --- Studio Floor & Grid ---
    const grid = new THREE.GridHelper(30, 40, '#00f0ff', '#121822');
    grid.position.y = -0.01;
    (grid.material as THREE.Material).opacity = 0.22;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // Circular Studio Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(3.8, 4.0, 0.1, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: '#0a0d14',
      roughness: 0.35,
      metalness: 0.8,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.06;
    scene.add(pedestal);

    // --- Car Materials Setup ---
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentColor.hex),
      metalness: currentColor.metalness,
      roughness: currentColor.roughness,
      clearcoat: currentColor.clearcoat,
      clearcoatRoughness: 0.03,
      reflectivity: 0.9,
    });
    bodyMatRef.current = bodyMaterial;

    const detailsMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3a424e'),
      metalness: 0.95,
      roughness: 0.25,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#020406'),
      metalness: 0.9,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transmission: 0.7,
      ior: 1.5,
    });

    const carGroup = new THREE.Group();
    scene.add(carGroup);

    const wheels: THREE.Object3D[] = [];

    // --- Load High-Fidelity Car Model or Fallback ---
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const textureLoader = new THREE.TextureLoader();

    // Load Contact Shadow Map
    textureLoader.load(
      '/models/car_ao.png',
      (shadowTex) => {
        shadowTex.colorSpace = THREE.SRGBColorSpace;
        const shadowMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2.7, 5.2),
          new THREE.MeshBasicMaterial({
            map: shadowTex,
            blending: THREE.MultiplyBlending,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
          })
        );
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.01;
        shadowMesh.renderOrder = 2;
        carGroup.add(shadowMesh);
      },
      undefined,
      () => {
        // Fallback procedural soft shadow disc
        const fallbackShadowGeo = new THREE.PlaneGeometry(3.0, 5.5);
        const fallbackShadowMat = new THREE.MeshBasicMaterial({
          color: '#000000',
          transparent: true,
          opacity: 0.65,
        });
        const fallbackShadow = new THREE.Mesh(fallbackShadowGeo, fallbackShadowMat);
        fallbackShadow.rotation.x = -Math.PI / 2;
        fallbackShadow.position.y = 0.01;
        carGroup.add(fallbackShadow);
      }
    );

    // Load Car GLB
    gltfLoader.load(
      '/models/car.glb',
      (gltf) => {
        const root = gltf.scene;

        // Traverse & Assign PBR Automotive Materials
        root.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = mesh.name.toLowerCase();
            if (name.includes('body')) {
              mesh.material = bodyMaterial;
            } else if (name.includes('glass')) {
              mesh.material = glassMaterial;
            } else if (name.includes('rim') || name.includes('trim') || name.includes('caliper')) {
              mesh.material = detailsMaterial;
            }
          }
        });

        // Collect wheels for rotation animations
        ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].forEach((wName) => {
          const w = root.getObjectByName(wName);
          if (w) wheels.push(w);
        });

        // Auto-center model
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        root.position.x -= center.x;
        root.position.z -= center.z;
        root.position.y -= box.min.y;

        carGroup.add(root);
        setIsLoaded(true);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.warn('car.glb not found at /models/car.glb. Run scripts/download-car-model.sh. Rendering aerodynamic cyber-streamlines fallback.', err);
        // Fallback: Elegant Futuristic Aerodynamic Laser Streamlines
        const particlesCount = 2000;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 6;
          positions[i * 3 + 1] = Math.random() * 2.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({
          color: '#00f0ff',
          size: 0.04,
          transparent: true,
          opacity: 0.7,
        });
        const particles = new THREE.Points(pGeo, pMat);
        carGroup.add(particles);
        setIsLoaded(true);
      }
    );

    // --- Interactive Orbit / Inertia ---
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0;
    let currentRotationY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevMouseX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      targetRotationY += deltaX * 0.008;
      prevMouseX = clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // --- Animation & Render Loop ---
    let reqId: number;
    let prevTime = performance.now();
    const currentLookAt = new THREE.Vector3(0, 0.4, 0);

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      // Inertial Rotation
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 7, dt);
      carGroup.rotation.y = currentRotationY;

      // Wheel Spin on Drag
      const spinSpeed = (targetRotationY - currentRotationY) * 2;
      wheels.forEach((w) => {
        w.rotation.x += spinSpeed;
      });

      // Camera Damping to Target Keyframe
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPosRef.current.x, 5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPosRef.current.y, 5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPosRef.current.z, 5, dt);

      currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, targetLookAtRef.current.x, 5, dt);
      currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, targetLookAtRef.current.y, 5, dt);
      currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, targetLookAtRef.current.z, 5, dt);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };
    animate();

    // --- Responsive Resize ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight, false);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup & Teardown ---
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);

      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Progress Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060709] z-20 transition-opacity duration-700">
          <div className="w-12 h-12 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400">
            INITIALIZING 3D ENGINE // {loadingProgress}%
          </span>
        </div>
      )}
    </div>
  );
}
