'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'hero' | 'attendance' | 'leave' | 'payroll' | 'approvals'>('hero');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setReducedMotion(true);
      return;
    }

    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1, 11);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 12, 10);
    scene.add(dirLight);

    const indigoPoint = new THREE.PointLight(0x6366f1, 5, 25);
    indigoPoint.position.set(3, 3, 4);
    scene.add(indigoPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 4, 25);
    emeraldPoint.position.set(-4, -2, 4);
    scene.add(emeraldPoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 4, 25);
    purplePoint.position.set(0, 4, -2);
    scene.add(purplePoint);

    // 3. Master HR Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // === ELEMENT A: 3D WORKDAY CLOCK RING (Attendance) ===
    const clockGroup = new THREE.Group();
    const clockRingGeo = new THREE.TorusGeometry(3.0, 0.12, 32, 100);
    const clockRingMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x064e3b,
      emissiveIntensity: 0.5,
    });
    const clockRing = new THREE.Mesh(clockRingGeo, clockRingMat);
    clockGroup.add(clockRing);

    // Clock Markers
    for (let i = 0; i < 12; i++) {
      const markerGeo = new THREE.BoxGeometry(0.08, 0.25, 0.08);
      const markerMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.1 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      const angle = (i / 12) * Math.PI * 2;
      marker.position.set(Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, 0);
      marker.rotation.z = angle;
      clockGroup.add(marker);
    }

    // Glowing Check-In Node (Green Orb)
    const checkInOrbGeo = new THREE.SphereGeometry(0.3, 24, 24);
    const checkInOrbMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1,
    });
    const checkInOrb = new THREE.Mesh(checkInOrbGeo, checkInOrbMat);
    checkInOrb.position.set(2.8, 0, 0);
    clockGroup.add(checkInOrb);

    clockGroup.rotation.x = Math.PI / 4;
    masterGroup.add(clockGroup);

    // === ELEMENT B: 3D LEAVE CALENDAR PLANE (Leave Management) ===
    const calendarGroup = new THREE.Group();
    const calBoardGeo = new THREE.BoxGeometry(3.2, 2.4, 0.15);
    const calBoardMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e1b4b,
      metalness: 0.3,
      roughness: 0.2,
      transmission: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const calBoard = new THREE.Mesh(calBoardGeo, calBoardMat);
    calendarGroup.add(calBoard);

    // Grid Day Markers on Calendar
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const pinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
        let pinColor = 0x818cf8;
        if (r === 1 && c === 2) pinColor = 0x10b981; // Present Pin
        if (r === 2 && c === 1) pinColor = 0xa855f7; // Leave Pin
        if (r === 0 && c === 3) pinColor = 0xf59e0b; // Half Day Pin

        const pinMat = new THREE.MeshStandardMaterial({
          color: pinColor,
          emissive: pinColor,
          emissiveIntensity: 0.6,
        });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.rotation.x = Math.PI / 2;
        pin.position.set(-1.1 + c * 0.75, 0.7 - r * 0.7, 0.1);
        calendarGroup.add(pin);
      }
    }

    calendarGroup.position.set(0, 0, 0.5);
    calendarGroup.rotation.y = -Math.PI / 6;
    masterGroup.add(calendarGroup);

    // === ELEMENT C: 3D PAYROLL SHIELD / VAULT CARD (Payroll Transparency) ===
    const payrollGroup = new THREE.Group();
    const shieldGeo = new THREE.BoxGeometry(1.6, 2.0, 0.12);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    payrollGroup.add(shield);

    // Currency Badge Symbol
    const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    coin.position.z = 0.12;
    payrollGroup.add(coin);

    payrollGroup.position.set(-2.8, -1.2, 1.2);
    payrollGroup.rotation.z = Math.PI / 8;
    masterGroup.add(payrollGroup);

    // === ELEMENT D: HR ALIGNMENT PARTICLES ===
    const particleCount = 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 16;
      particlePos[i + 1] = (Math.random() - 0.5) * 16;
      particlePos[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.09,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation & Scroll Response Loop
    let animationFrameId: number;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;
      targetRotY = mouseX * 0.6;
      targetRotX = mouseY * 0.6;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      masterGroup.rotation.y = scrollY * 0.0012;
      masterGroup.position.y = Math.sin(scrollY * 0.002) * 0.5;

      // Determine active section based on scroll depth
      if (scrollY < 400) setActiveFeature('hero');
      else if (scrollY < 900) setActiveFeature('attendance');
      else if (scrollY < 1400) setActiveFeature('leave');
      else if (scrollY < 1900) setActiveFeature('payroll');
      else setActiveFeature('approvals');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    const animate = () => {
      // Continuous rotation of sub-elements
      clockGroup.rotation.z += 0.004;
      checkInOrb.position.x = Math.cos(Date.now() * 0.002) * 2.8;
      checkInOrb.position.y = Math.sin(Date.now() * 0.002) * 2.8;

      calendarGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.15;
      payrollGroup.rotation.y += 0.008;

      particles.rotation.y += 0.0008;

      // Mouse Smooth Follow (LERP)
      masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.04;
      masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.04;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

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
      <div className="w-full h-full min-h-[420px] flex items-center justify-center relative">
        <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500/20 via-emerald-500/20 to-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-3xl border border-indigo-500/40 glass-panel flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold">
              HR
            </div>
            <h4 className="text-base font-bold text-white">Workday Alignment Engine</h4>
            <p className="text-xs text-slate-400">Real-Time Attendance • Leave Gauges • Payroll Vault</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[580px]">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Dynamic Floating Label Overlay matching active scroll section */}
      <div className="absolute bottom-4 left-4 right-4 glass-panel p-3.5 rounded-2xl border border-indigo-500/30 flex items-center justify-between text-xs text-slate-200 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-slate-100">
            {activeFeature === 'hero' && '3D HR Workday Alignment Engine'}
            {activeFeature === 'attendance' && '3D Attendance Clock-In Loop'}
            {activeFeature === 'leave' && '3D Leave Calendar Quota Board'}
            {activeFeature === 'payroll' && '3D Payroll Vault & Payslip Card'}
            {activeFeature === 'approvals' && '3D HR Approval Synchronization Hub'}
          </span>
        </div>
        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Content Active
        </span>
      </div>
    </div>
  );
}
