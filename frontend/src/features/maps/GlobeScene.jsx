import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const GlobeScene = () => {
  const mountRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Globe Core Sphere (Dark Midnight Surface)
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x181824,
      wireframe: false,
    });
    const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(globe);

    // Wireframe Grid / Lat-Long Ribs (Aurora Violet & Cyan)
    const wireGeometry = new THREE.WireframeGeometry(new THREE.SphereGeometry(1.005, 24, 24));
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x8B5CF6,
      transparent: true,
      opacity: 0.35,
    });
    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    scene.add(wireframe);

    // Outer Atmospheric Glow
    const haloGeometry = new THREE.SphereGeometry(1.15, 32, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x22D3EE,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    scene.add(halo);

    // Pulse Disaster Pins (India / Bay of Bengal coordinates)
    const createPin = (lat, lon, colorHex) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(Math.sin(phi) * Math.cos(theta));
      const z = Math.sin(phi) * Math.sin(theta);
      const y = Math.cos(phi);

      const pinGeo = new THREE.SphereGeometry(0.035, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(x * 1.02, y * 1.02, z * 1.02);
      return pinMesh;
    };

    const pin1 = createPin(17.3850, 78.4867, 0xEF4444); // Hyderabad (Red)
    const pin2 = createPin(19.0760, 72.8777, 0xF59E0B); // Mumbai (Yellow)
    const pin3 = createPin(13.0827, 80.2707, 0x22D3EE); // Chennai (Cyan)
    const pin4 = createPin(22.5726, 88.3639, 0x8B5CF6); // Kolkata (Purple)

    globe.add(pin1);
    globe.add(pin2);
    globe.add(pin3);
    globe.add(pin4);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        globe.rotation.y += 0.0025;
        wireframe.rotation.y += 0.0025;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
    };
  }, []);

  if (!webGlSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-2/50 rounded-2xl border border-border p-8 text-center">
        <div>
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold">
            DR360
          </div>
          <p className="text-sm font-semibold text-text-primary">2D Geographic Visualization Mode</p>
          <p className="text-xs text-text-muted mt-1">WebGL is disabled or unsupported on this display.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[360px] flex items-center justify-center relative cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Disaster Awareness Globe"
    />
  );
};
