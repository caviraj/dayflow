'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * EmployeeOrbScene
 * Three.js scene: Soft glowing spheres connected by teal network lines.
 * Symbolizes human connection, collaboration, and personal flow.
 */
export default function EmployeeOrbScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 280;

    // ── Scene Setup ──────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const tealPoint = new THREE.PointLight(0x0D9488, 8, 40);
    tealPoint.position.set(0, 0, 8);
    scene.add(tealPoint);

    const cyanPoint = new THREE.PointLight(0x0891B2, 5, 30);
    cyanPoint.position.set(-6, 4, 6);
    scene.add(cyanPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 4, 25);
    emeraldPoint.position.set(6, -3, 5);
    scene.add(emeraldPoint);

    // ── Materials ────────────────────────────────────────────
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0D9488,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x059669,
      emissiveIntensity: 0.3,
    });

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x5EEAD4,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0x0D9488,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.9,
    });

    // ── Central "person" orb ─────────────────────────────────
    const coreGeo  = new THREE.SphereGeometry(1.2, 32, 32);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Outer glow shell
    const glowGeo  = new THREE.SphereGeometry(1.5, 32, 32);
    const glowMesh = new THREE.Mesh(
      glowGeo,
      new THREE.MeshBasicMaterial({
        color: 0x5EEAD4,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
      }),
    );
    scene.add(glowMesh);

    // ── Network nodes (people spheres) ───────────────────────
    interface Node {
      mesh: THREE.Mesh;
      pos:  THREE.Vector3;
      vel:  THREE.Vector3;
      size: number;
    }
    const nodes: Node[] = [];
    const nodeCount = 18;
    const nodeGeo   = new THREE.SphereGeometry(1, 16, 16);

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.acos((Math.random() - 0.5) * 2);
      const phi   = Math.random() * Math.PI * 2;
      const r     = 3 + Math.random() * 5;
      const size  = 0.12 + Math.random() * 0.22;

      const mat  = sphereMat.clone();
      mat.emissiveIntensity = 0.1 + Math.random() * 0.5;
      const mesh = new THREE.Mesh(nodeGeo, mat);

      mesh.scale.setScalar(size);
      mesh.position.set(
        Math.sin(theta) * Math.cos(phi) * r,
        Math.sin(theta) * Math.sin(phi) * r * 0.6,
        Math.cos(theta) * r * 0.4,
      );

      scene.add(mesh);
      nodes.push({
        mesh,
        pos: mesh.position.clone(),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          0,
        ),
        size,
      });
    }

    // ── Connection lines ─────────────────────────────────────
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x5EEAD4,
      transparent: true,
      opacity: 0.12,
    });
    const lineGroup = new THREE.Group();
    scene.add(lineGroup);

    const updateLines = () => {
      lineGroup.clear();
      // Connect nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
          if (dist < 4.5) {
            const opacity = (1 - dist / 4.5) * 0.25;
            const pts = [
              nodes[i].mesh.position.clone(),
              nodes[j].mesh.position.clone(),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
              color: 0x5EEAD4,
              transparent: true,
              opacity,
            });
            lineGroup.add(new THREE.Line(geo, mat));
          }
        }
        // Connect some to core
        if (i < 6) {
          const pts = [new THREE.Vector3(0, 0, 0), nodes[i].mesh.position.clone()];
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          lineGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
            color: 0x0D9488, transparent: true, opacity: 0.08,
          })));
        }
      }
    };

    // ── Particle field ───────────────────────────────────────
    const particleCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x5EEAD4, size: 0.05, transparent: true, opacity: 0.4 }),
    );
    scene.add(particles);

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
      t += 0.007;

      // Breathe core
      const breathe = 1 + Math.sin(t * 1.2) * 0.06;
      coreMesh.scale.setScalar(breathe);
      glowMesh.scale.setScalar(breathe * 1.15);
      coreMesh.rotation.y = t * 0.2;
      coreMesh.rotation.x = Math.sin(t * 0.3) * 0.15;

      // Drift nodes organically
      nodes.forEach((n, i) => {
        n.mesh.position.x += Math.sin(t * 0.5 + i) * 0.008;
        n.mesh.position.y += Math.cos(t * 0.4 + i) * 0.005;
        // Gentle pull back to original position
        n.mesh.position.lerp(n.pos, 0.003);
      });

      // Update lines occasionally
      if (Math.round(t * 60) % 2 === 0) updateLines();

      // Particles drift
      particles.rotation.y = t * 0.03;
      particles.rotation.x = t * 0.015;

      // Camera parallax
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.035;
      camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);

      // Pulsate teal light
      tealPoint.intensity = 6 + Math.sin(t * 1.5) * 2.5;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ───────────────────────────────────────────────
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
