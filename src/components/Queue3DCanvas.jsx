import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Queue3DCanvas
 * A high-performance, interactive 3D WebGL experience using Three.js.
 * Renders an ethereal holographic Quantum Queue Loop surrounded by an orbital
 * swarm of warm amber and medical cyan data particles with mouse parallax.
 * 
 * When exitLeft is triggered:
 * The closed 3D Torus Knot loop snaps open at a vertex point, uncoils into an
 * undulating serpentine body, and slithers smoothly to the left like a snake,
 * while the particle swarm and rings sweep in its wake.
 */
export const Queue3DCanvas = ({ 
  speedMultiplier = 1, 
  warp = false,
  exitLeft = false,
  className = '',
  interactive = true 
}) => {
  const mountRef = useRef(null);
  const stateRef = useRef({
    speed: speedMultiplier,
    warp: warp,
    exitLeft: exitLeft,
    exitProgress: 0,
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
  });

  // Keep state refs updated without rebuilding Three.js scene
  useEffect(() => {
    stateRef.current.speed = speedMultiplier;
    stateRef.current.warp = warp;
  }, [speedMultiplier, warp]);

  // Handle serpentine snap and uncoil exit to the left
  useEffect(() => {
    if (exitLeft) {
      stateRef.current.exitLeft = true;
      gsap.to(stateRef.current, {
        exitProgress: 1,
        duration: 0.85,
        ease: 'power2.inOut',
      });
    } else {
      stateRef.current.exitLeft = false;
      gsap.to(stateRef.current, {
        exitProgress: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, [exitLeft]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Completely transparent
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 1.2);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 4, 15);
    amberLight.position.set(3, 2, 4);
    scene.add(amberLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 15);
    cyanLight.position.set(-3, -2, 3);
    scene.add(cyanLight);

    // 5. Centerpiece: Quantum Queue Knot (Holographic Lattice)
    const group = new THREE.Group();
    scene.add(group);

    // Knot geometry with 120 tubular segments and 24 radial segments
    const knotGeo = new THREE.TorusKnotGeometry(1.35, 0.32, 120, 24, 2, 3);
    const originalKnotPositions = new Float32Array(knotGeo.attributes.position.array);

    // Core physical translucent glass material
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1005,
      emissive: 0x6b2904,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.72,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    group.add(knotMesh);

    // Holographic wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const wireMesh = new THREE.Mesh(knotGeo, wireMat);
    group.add(wireMesh);

    // Luminous vertex points around knot
    const knotPointsMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const knotPoints = new THREE.Points(knotGeo, knotPointsMat);
    group.add(knotPoints);

    // 6. Orbital Queue Rings
    const ringGeo1 = new THREE.TorusGeometry(2.4, 0.02, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.35;
    ring1.rotation.y = Math.PI * 0.15;
    group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.8, 0.015, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Medical emerald
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.z = Math.PI * 0.22;
    group.add(ring2);

    // 7. Dynamic Data Particle Swarm (450 particles flowing in 3D vortex)
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const initialRadii = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const yOffsets = new Float32Array(particleCount);

    const amberColor = new THREE.Color(0xf59e0b);
    const goldColor = new THREE.Color(0xfbbf24);
    const cyanColor = new THREE.Color(0x38bdf8);
    const emeraldColor = new THREE.Color(0x34d399);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.8 + Math.random() * 2.6;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.5;
      const speed = (0.3 + Math.random() * 0.7) * (Math.random() > 0.3 ? 1 : -1);

      initialRadii[i] = radius;
      angles[i] = angle;
      speeds[i] = speed;
      yOffsets[i] = y;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color distribution: 65% amber/gold, 25% cyan, 10% emerald
      const rand = Math.random();
      let chosenColor;
      if (rand < 0.65) chosenColor = Math.random() > 0.5 ? amberColor : goldColor;
      else if (rand < 0.90) chosenColor = cyanColor;
      else chosenColor = emeraldColor;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Mouse interaction
    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetX = x * 0.45;
      stateRef.current.targetY = y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 9. Resize handler with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 10. Animation Loop
    const startTime = performance.now();
    let lastTime = startTime;

    // Preallocated ring buffers for high-performance zero-allocation vertex deformation
    const ringSnapStretch = new Float32Array(120);
    const ringSlitherY = new Float32Array(120);
    const ringDepthZ = new Float32Array(120);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const time = (now - startTime) / 1000;

      const currentSpeed = (stateRef.current.warp ? 2.5 : 1) * stateRef.current.speed;

      // Smooth mouse parallax lerp
      stateRef.current.mouseX += (stateRef.current.targetX - stateRef.current.mouseX) * 0.04;
      stateRef.current.mouseY += (stateRef.current.targetY - stateRef.current.mouseY) * 0.04;

      // Standard central rotation & gentle breathing
      group.rotation.x = time * 0.09 * currentSpeed + stateRef.current.mouseY;
      group.rotation.y = time * 0.12 * currentSpeed + stateRef.current.mouseX;
      let basePosY = Math.sin(time * 0.5) * 0.06;

      // Counter-rotate rings for calm multi-axis gyroscopic motion
      ring1.rotation.z += 0.0025 * currentSpeed;
      ring2.rotation.y += 0.002 * currentSpeed;

      // Calm pulse on knot opacity and point sizes
      knotPointsMat.size = 0.04 + Math.sin(time * 1.2) * 0.012;
      knotMat.emissiveIntensity = 0.45 + Math.sin(time * 1.0) * 0.2;

      // SERPENTINE SNAKE SNAP & UNCOIL SLITHER TO THE LEFT (Ultra-optimized 120-ring pipeline)
      const p = stateRef.current.exitProgress;
      if (p > 0) {
        if (p < 1) {
          group.visible = true;
          const knotPos = knotGeo.attributes.position.array;
          const slitherAmp = 1.35 * (1 - p * 0.4);
          const zScale = 1 - p * 0.7;

          for (let t = 0; t < 120; t++) {
            const tNorm = t / 120;
            const segmentProgress = Math.max(0, p * 1.45 - tNorm * 0.45);
            ringSnapStretch[t] = Math.pow(segmentProgress, 1.25) * 22;
            ringSlitherY[t] = Math.sin(p * 9 + tNorm * 12.56637) * slitherAmp;
            ringDepthZ[t] = Math.cos(p * 7 + tNorm * 9.42477) * 0.6;
          }

          let vIdx = 0;
          for (let t = 0; t < 120; t++) {
            const stretch = ringSnapStretch[t];
            const slitherY = ringSlitherY[t];
            const depthZ = ringDepthZ[t];
            for (let r = 0; r < 25; r++) {
              knotPos[vIdx] = originalKnotPositions[vIdx] - stretch;
              knotPos[vIdx + 1] = originalKnotPositions[vIdx + 1] + slitherY;
              knotPos[vIdx + 2] = originalKnotPositions[vIdx + 2] * zScale + depthZ;
              vIdx += 3;
            }
          }
          knotGeo.attributes.position.needsUpdate = true;
        } else {
          group.visible = false; // Free 100% GPU raster power when exited off-screen
        }

        // Rings also stretch and sweep left
        ring1.position.x = -Math.pow(p, 1.2) * 20;
        ring2.position.x = -Math.pow(p, 1.1) * 22;

        // Particle swarm sweeps along in the snake's draft
        const particleX = -Math.pow(p, 1.2) * 22;
        particleSystem.position.x = particleX;
        particleSystem.position.y = Math.sin(p * 6) * 0.8;

        // Graceful opacity fade out towards the off-screen exit
        const fade = Math.max(0, 1 - Math.pow(p, 1.8));
        knotMat.opacity = 0.72 * fade;
        wireMat.opacity = 0.18 * fade;
        knotPointsMat.opacity = 0.75 * fade;
        ringMat1.opacity = 0.55 * fade;
        ringMat2.opacity = 0.45 * fade;
        particleMat.opacity = 0.85 * fade;
      } else {
        group.visible = true;
        // Reset to original closed knot geometry when exitProgress === 0
        const knotPos = knotGeo.attributes.position.array;
        if (knotPos[0] !== originalKnotPositions[0]) {
          for (let i = 0; i < originalKnotPositions.length; i++) {
            knotPos[i] = originalKnotPositions[i];
          }
          knotGeo.attributes.position.needsUpdate = true;
        }
        group.position.x = 0;
        group.position.y = basePosY;
        ring1.position.x = 0;
        ring2.position.x = 0;
        particleSystem.position.x = 0;
        particleSystem.position.y = 0;

        knotMat.opacity = 0.72;
        wireMat.opacity = 0.18;
        knotPointsMat.opacity = 0.75;
        ringMat1.opacity = 0.55;
        ringMat2.opacity = 0.45;
        particleMat.opacity = 0.85;
      }

      // Animate flowing particle vortex with slow, elegant drift
      const posArray = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i] * delta * 0.18 * currentSpeed;
        const r = initialRadii[i] + Math.sin(time * 0.6 + i) * 0.22;
        const currentY = yOffsets[i] + Math.cos(time * 0.5 + i) * 0.15;

        posArray[i * 3] = Math.cos(angles[i]) * r;
        posArray[i * 3 + 1] = currentY;
        posArray[i * 3 + 2] = Math.sin(angles[i]) * r;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Camera parallax tilt response
      camera.position.x = stateRef.current.mouseX * 0.5;
      camera.position.y = stateRef.current.mouseY * 0.35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();

      // Dispose Three.js resources
      knotGeo.dispose();
      knotMat.dispose();
      wireMat.dispose();
      knotPointsMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className || ''}`} 
      style={{ touchAction: 'none' }}
    />
  );
};

export default Queue3DCanvas;
