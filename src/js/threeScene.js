/* ==========================================================================
   THREE.JS 3D SCENE & HERO EMBLEM ENGINE
   Manages 3D Hero candles, 3D Gold "34", camera parallax, & lighting
   ========================================================================== */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class ThreeSceneManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lights = [];
    this.heroGroup = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    try {
      // Scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x080608, 0.04);

      // Camera
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 15);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lighting System (Warm candlelight & gold speculars)
      const ambientLight = new THREE.AmbientLight(0x2c0b1e, 1.2);
      this.scene.add(ambientLight);

      // Main Candlelight Point Source 1
      const candleLight1 = new THREE.PointLight(0xd4af37, 3, 25);
      candleLight1.position.set(-4, 3, 5);
      this.scene.add(candleLight1);
      this.lights.push(candleLight1);

      // Main Candlelight Point Source 2 (Warm rose flame)
      const candleLight2 = new THREE.PointLight(0xf4acb7, 2.5, 25);
      candleLight2.position.set(4, -2, 5);
      this.scene.add(candleLight2);
      this.lights.push(candleLight2);

      // Build 3D Hero Elements
      this.buildHeroEmblem();

      // Listeners
      window.addEventListener('resize', () => this.onResize());
      document.addEventListener('mousemove', (e) => this.onMouseMove(e));

      // Animation Loop
      this.animate();

    } catch (e) {
      console.warn('WebGL initialization fallback activated:', e);
    }
  }

  buildHeroEmblem() {
    this.heroGroup = new THREE.Group();

    // Metallic Gold Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x3a2606,
      emissiveIntensity: 0.3
    });

    // Outer Orbiting Rings
    const ringGeo1 = new THREE.TorusGeometry(4.5, 0.08, 16, 100);
    const ring1 = new THREE.Mesh(ringGeo1, goldMaterial);
    ring1.rotation.x = Math.PI / 3;
    this.heroGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(5.2, 0.05, 16, 100);
    const ring2 = new THREE.Mesh(ringGeo2, new THREE.MeshStandardMaterial({
      color: 0xe0a899,
      metalness: 0.9,
      roughness: 0.1
    }));
    ring2.rotation.y = Math.PI / 4;
    this.heroGroup.add(ring2);

    // Floating 3D Candle Flames
    for (let i = 0; i < 5; i++) {
      const flameGeo = new THREE.ConeGeometry(0.25, 0.8, 16);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9d00 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      const angle = (i / 5) * Math.PI * 2;
      flame.position.set(Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0);
      this.heroGroup.add(flame);
    }

    this.scene.add(this.heroGroup);
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth Mouse Camera Tilt Parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 2;
    this.camera.position.y = -this.mouse.y * 2;
    this.camera.lookAt(0, 0, 0);

    // Rotate 3D Hero Emblem
    if (this.heroGroup) {
      this.heroGroup.rotation.y = elapsedTime * 0.15;
      this.heroGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15;
    }

    // Candle Flicker Animation
    if (this.lights.length > 0) {
      this.lights[0].intensity = 3 + Math.sin(elapsedTime * 8) * 0.4;
      this.lights[1].intensity = 2.5 + Math.cos(elapsedTime * 6) * 0.3;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
