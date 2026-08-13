/* ==========================================================================
   PARTICLE & BOKEH CANVAS ANIMATION ENGINE
   Provides floating gold bokeh, ambient warm sparkles, and burst effects
   ========================================================================== */

export class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.burstParticles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Performance limit based on screen size
    this.maxParticles = window.innerWidth < 768 ? 45 : 90;
    this.isMetamorphosis = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Generate initial ambient bokeh particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2, // Slow upward float
      color: Math.random() > 0.4 ? '#d4af37' : (Math.random() > 0.5 ? '#f4acb7' : '#f7e7b4'),
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2
    };
  }

  // Trigger burst at x, y (e.g., when opening gift box or unlocking reason)
  triggerBurst(x, y, count = 40) {
    const burstX = x || this.width / 2;
    const burstY = y || this.height / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.burstParticles.push({
        x: burstX,
        y: burstY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 1.5,
        color: Math.random() > 0.3 ? '#d4af37' : '#ffffff',
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  // Trigger grand metamorphosis mode (Final Surprise section)
  triggerMetamorphosis() {
    this.isMetamorphosis = true;
    this.particles = [];
    
    // Create dense converging golden stars
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.width;
      this.particles.push({
        x: this.width / 2 + Math.cos(angle) * dist,
        y: this.height / 2 + Math.sin(angle) * dist,
        targetX: this.width / 2 + (Math.random() - 0.5) * 300,
        targetY: this.height / 2 + (Math.random() - 0.5) * 200,
        radius: Math.random() * 4 + 2,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.02,
        color: Math.random() > 0.5 ? '#f7e7b4' : '#d4af37'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (!this.isMetamorphosis) {
      // Standard Bokeh floating loop
      for (let p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        // Wrap around screen
        if (p.y < -10) p.y = this.height + 10;
        if (p.x < -10) p.x = this.width + 10;
        if (p.x > this.width + 10) p.x = -10;

        const currentOpacity = Math.max(0.1, p.opacity + Math.sin(p.pulsePhase) * 0.25);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = currentOpacity;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Render Burst Particles
      for (let i = this.burstParticles.length - 1; i >= 0; i--) {
        const bp = this.burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.alpha -= bp.decay;

        if (bp.alpha <= 0) {
          this.burstParticles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = bp.color;
        this.ctx.globalAlpha = bp.alpha;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = bp.color;
        this.ctx.fill();
        this.ctx.restore();
      }

    } else {
      // Metamorphosis Converging Stars
      for (let p of this.particles) {
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}
