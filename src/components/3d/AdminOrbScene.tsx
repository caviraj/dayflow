'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * AdminOrbScene
 * Three.js scene: Rotating geometric cube-nodes in a violet orbital formation.
 * Symbolizes administrative authority, structure, and control.
 * Renders into a WebGL canvas with alpha=true so it floats over the dashboard header.
 */
export default function AdminOrbScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 280;

    // ── Scene Setup ──────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const violetPoint = new THREE.PointLight(0x7C3AED, 8, 40);
    violetPoint.position.set(0, 0, 8);
    scene.add(violetPoint);

    const indigoPoint = new THREE.PointLight(0x4F46E5, 5, 30);
    indigoPoint.position.set(-6, 4, 6);
    scene.add(indigoPoint);

    const purplePoint = new THREE.PointLight(0xA78BFA, 4, 25);
    purplePoint.position.set(6, -3, 5);
    scene.add(purplePoint);

    // ── Materials ────────────────────────────────────────────
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x7C3AED,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x4F46E5,
      emissiveIntensity: 0.3,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xA78BFA,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xC4B5FD,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x7C3AED,
      emissiveIntensity: 0.6,
    });

    // ── Central authority sphere ─────────────────────────────
    const coreGeo  = new THREE.IcosahedronGeometry(1.1, 1);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Wireframe overlay on core
    const coreWire = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
      color: 0xA78BFA, wireframe: true, transparent: true, opacity: 0.25,
    }));
    coreWire.scale.setScalar(1.05);
    scene.add(coreWire);

    // ── Orbital cube nodes ───────────────────────────────────
    const orbitNodes: { mesh: THREE.Mesh; wire: THREE.Mesh; angle: number; radius: number; speed: number; yOff: number }[] = [];
    const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const radii   = [3.5, 5.2, 7.0];
    const counts  = [5,   7,   9];

    radii.forEach((r, ri) => {
      const n = counts[ri];
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const mesh  = new THREE.Mesh(cubeGeo, cubeMat.clone());
        const wire  = new THREE.Mesh(cubeGeo, wireMat);
        const yOff  = (Math.random() - 0.5) * 2;
        const scale = 0.6 + Math.random() * 0.5;

        mesh.scale.setScalar(scale);
        wire.scale.setScalar(scale * 1.12);

        mesh.position.set(
          Math.cos(angle) * r,
          yOff,
          Math.sin(angle) * r * 0.4,
        );
        wire.position.copy(mesh.position);

        scene.add(mesh);
        scene.add(wire);

        orbitNodes.push({
          mesh, wire,
          angle,
          radius: r,
          speed:  0.0004 + ri * 0.0003 + Math.random() * 0.0002,
          yOff,
        });
      }
    });

    // ── Connecting lines (authority network) ─────────────────
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x7C3AED,
      transparent: true,
      opacity: 0.15,
    });

    const lineGroup = new THREE.Group();
    scene.add(lineGroup);

    const updateLines = () => {
      lineGroup.clear();
      // Connect adjacent nodes in each ring
      let nodeIdx = 0;
      counts.forEach((count) => {
        const ring = orbitNodes.slice(nodeIdx, nodeIdx + count);
        ring.forEach((n, i) => {
          const next = ring[(i + 1) % count];
          const pts = [n.mesh.position.clone(), next.mesh.position.clone()];
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          lineGroup.add(new THREE.Line(geo, lineMat));
        });
        // Connect to core
        if (ring[0]) {
          const pts = [new THREE.Vector3(0, 0, 0), ring[0].mesh.position.clone()];
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          lineGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
            color: 0x7C3AED, transparent: true, opacity: 0.08,
          })));
        }
        nodeIdx += count;
      });
    };

    // ── Particle field ───────────────────────────────────────
    const particleGeo  = new THREE.BufferGeometry();
    const particleCount = 120;
    const positions     = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMesh = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0xA78BFA, size: 0.06, transparent: true, opacity: 0.5 }),
    );
    scene.add(particleMesh);

    // ── Mouse parallax ───────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Animation loop ───────────────────────────────────────
    let frameId: number;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.008;

      // Rotate core
      coreMesh.rotation.x = t * 0.3;
      coreMesh.rotation.y = t * 0.5;
      coreWire.rotation.x = -t * 0.25;
      coreWire.rotation.y = -t * 0.4;

      // Orbit nodes
      orbitNodes.forEach((node) => {
        node.angle += node.speed;
        node.mesh.position.set(
          Math.cos(node.angle) * node.radius,
          node.yOff + Math.sin(t * 0.8 + node.angle) * 0.4,
          Math.sin(node.angle) * node.radius * 0.4,
        );
        node.wire.position.copy(node.mesh.position);
        node.mesh.rotation.x += 0.015;
        node.mesh.rotation.y += 0.02;
        node.wire.rotation.x = node.mesh.rotation.x;
        node.wire.rotation.y = node.mesh.rotation.y;
      });

      // Update connecting lines every few frames
      if (Math.round(t * 60) % 3 === 0) updateLines();

      // Particle drift
      particleMesh.rotation.y = t * 0.04;

      // Camera parallax
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Pulsate violet light
      violetPoint.intensity = 6 + Math.sin(t * 2) * 2;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ───────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '240px' }}
      aria-hidden="true"
    />
  );
}
