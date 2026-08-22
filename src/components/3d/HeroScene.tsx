'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setReducedMotion(true);
      return;
    }

    if (!containerRef.current) return;

    // Setup Three.js Scene, Camera, Renderer
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 4, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 3, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Floating Torus Ring (Workday Loop)
    const torusGeometry = new THREE.TorusGeometry(3.2, 0.15, 32, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x312e81,
      emissiveIntensity: 0.4,
    });
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.rotation.x = Math.PI / 3;
    mainGroup.add(torusMesh);

    // 2. Inner Orbiting Ring (Calendar Alignment)
    const innerRingGeo = new THREE.TorusGeometry(2.2, 0.08, 24, 80);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.9,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRingMesh.rotation.y = Math.PI / 4;
    mainGroup.add(innerRingMesh);

    // 3. Floating Geometric Glass Cubes (Day Cards)
    const cubeCount = 6;
    const cubeGroup = new THREE.Group();
    const cubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const cubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.5,
    });

    for (let i = 0; i < cubeCount; i++) {
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      const angle = (i / cubeCount) * Math.PI * 2;
      cube.position.set(Math.cos(angle) * 4, Math.sin(angle) * 4, (Math.random() - 0.5) * 2);
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      cubeGroup.add(cube);
    }
    mainGroup.add(cubeGroup);

    // 4. Background Star / Particle Field
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 15;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xa855f7,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation & Scroll Interaction Loop
    let animationFrameId: number;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = (e.clientX / window.innerWidth) - 0.5;
      const mouseY = (e.clientY / window.innerHeight) - 0.5;
      targetRotationY = mouseX * 0.8;
      targetRotationX = mouseY * 0.8;
    };

    const handleScroll = () => {
      const scrollPos = window.scrollY || 0;
      mainGroup.rotation.z = scrollPos * 0.0015;
      mainGroup.position.y = -scrollPos * 0.002;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    const animate = () => {
      torusMesh.rotation.z += 0.005;
      innerRingMesh.rotation.x += 0.008;
      cubeGroup.rotation.y += 0.004;
      particles.rotation.y += 0.001;

      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (reducedMotion) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
        <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-56 h-56 rounded-3xl border-2 border-indigo-500/40 glass-panel flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-black text-gradient-indigo">Dayflow 3D</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] sm:h-[500px] lg:h-[560px] relative pointer-events-auto cursor-grab active:cursor-grabbing"
    />
  );
}
