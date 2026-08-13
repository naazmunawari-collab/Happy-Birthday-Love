/* ==========================================================================
   MAIN APPLICATION ENGINE
   Binds configuration data, UI interactions, modals, and section transitions
   ========================================================================== */

import { birthdayData } from '../config/birthdayData.js';
import { ParticleEngine } from './particles.js';
import { AudioController } from './audio.js';
import { ThreeSceneManager } from './threeScene.js';

class BirthdayApp {
  constructor() {
    this.data = birthdayData;
    this.particles = null;
    this.audio = null;
    this.threeScene = null;
    this.unlockedReasonsCount = 0;
    this.unlockedReasonsSet = new Set();

    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initPreloader();
      this.initEngines();
      this.initCursorGlow();
      this.renderDynamicContent();
      this.bindEvents();
    });
  }

  initPreloader() {
    const preloader = document.getElementById('loading-screen');
    if (!preloader) return;

    setTimeout(() => {
      preloader.classList.add('hidden');
      this.startSecretOpeningSequence();
    }, 1200);
  }

  initEngines() {
    this.particles = new ParticleEngine('particle-canvas');
    this.audio = new AudioController(this.data.audio.src);
    this.threeScene = new ThreeSceneManager('three-canvas');
  }

  initCursorGlow() {
    const cursor = document.querySelector('.cursor-glow');
    if (!cursor) return;

    window.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
  }

  /* ------------------------------------------------------------------------
     1. Secret Opening Sequence (Section 1)
     ------------------------------------------------------------------------ */
  startSecretOpeningSequence() {
    const line1 = document.getElementById('opening-line-1');
    const line2 = document.getElementById('opening-line-2');
    const line3 = document.getElementById('opening-line-3');
    const line4 = document.getElementById('opening-line-4');
    const enterBtn = document.getElementById('btn-enter-surprise');

    // Step 1: "I made something for you..."
    setTimeout(() => line1?.classList.add('active'), 600);

    // Step 2: "Because today isn't just another day."
    setTimeout(() => line2?.classList.add('active'), 2400);

    // Step 3: "Today, my favorite person turns 34."
    setTimeout(() => line3?.classList.add('active'), 4200);

    // Step 4: "Happy 34th Birthday, Syed Yousuf ❤️"
    setTimeout(() => line4?.classList.add('active'), 6000);

    // Step 5: Reveal Enter Button
    setTimeout(() => enterBtn?.classList.add('visible'), 7600);
  }

  enterMainExperience() {
    const secretSection = document.getElementById('section-secret-opening');
    const mainExp = document.getElementById('main-experience');
    const floatingNav = document.querySelector('.floating-nav');

    secretSection?.classList.add('fade-out');
    mainExp?.classList.add('active');
    floatingNav?.classList.add('visible');

    // Start background audio on user interaction
    this.audio.play();

    // Scroll to Hero section smoothly
    const heroSection = document.getElementById('section-hero');
    heroSection?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------------
     2. Dynamic Content Rendering
     ------------------------------------------------------------------------ */
  renderDynamicContent() {
    this.renderCalendar();
    this.renderMemories();
    this.renderReasons();
    this.renderTimeline();
    this.renderLetter();
    this.renderWishes();
  }

  // Section 2 - August Birthday Calendar
  renderCalendar() {
    const container = document.getElementById('august-calendar-grid');
    if (!container) return;

    // August 2026 starts on Saturday (6th column in Sun-Sat grid)
    let html = '';
    
    // 6 Empty padding cells before August 1st
    for (let i = 0; i < 6; i++) {
      html += `<div class="calendar-date-cell empty"></div>`;
    }

    // Days 1 through 31
    for (let day = 1; day <= 31; day++) {
      const isSpecial = (day === 16);
      if (isSpecial) {
        html += `
          <div class="calendar-date-cell birthday-date" data-calendar-day="${day}">
            <div>${day}</div>
            <div class="heart-badge">❤️</div>
          </div>
        `;
      } else {
        html += `<div class="calendar-date-cell"><div>${day}</div></div>`;
      }
    }

    container.innerHTML = html;
  }

  // Section 4 - Memories Gallery
  renderMemories() {
    const container = document.getElementById('memories-grid');
    if (!container) return;

    container.innerHTML = this.data.memories.map(mem => `
      <div class="polaroid-card" data-memory-id="${mem.id}">
        <div class="polaroid-img-wrapper">
          <img src="${mem.image}" alt="${mem.caption}" class="polaroid-img" onerror="this.src='assets/photos/photo-01.jpg'" />
        </div>
        <div class="polaroid-caption">${mem.caption}</div>
        <div class="polaroid-date">${mem.date}</div>
      </div>
    `).join('');
  }

  // Section 5 - 34 Reasons Nodes
  renderReasons() {
    const container = document.getElementById('reasons-grid');
    if (!container) return;

    container.innerHTML = this.data.reasons.map((reason, index) => `
      <div class="reason-node" data-reason-index="${index}">
        <div class="node-number">#${index + 1}</div>
        <div class="node-label">Reason</div>
      </div>
    `).join('');

    this.updateReasonsCounter();
  }

  updateReasonsCounter() {
    const counter = document.getElementById('reasons-counter-text');
    if (counter) {
      counter.textContent = `${this.unlockedReasonsSet.size} of ${this.data.reasons.length} Reasons Unlocked ❤️`;
    }
  }

  // Section 6 - Journey Timeline
  renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = this.data.journey.map(item => `
      <div class="timeline-item">
        <div class="timeline-node"></div>
        <div class="timeline-card">
          <div class="timeline-chapter">${item.chapter}</div>
          <div class="timeline-title">${item.title}</div>
          <div class="timeline-date">${item.date}</div>
          <div class="timeline-desc">${item.description}</div>
        </div>
      </div>
    `).join('');
  }

  // Section 7 - Letter
  renderLetter() {
    const letterText = document.getElementById('letter-text-content');
    if (letterText) {
      letterText.textContent = this.data.letterContent;
    }
  }

  // Section 8 - Wishes Grid
  renderWishes() {
    const container = document.getElementById('wishes-grid');
    if (!container) return;

    container.innerHTML = this.data.wishes.map(wish => `
      <div class="wish-card" data-wish-id="${wish.id}">
        <div class="wish-card-inner">
          <div class="wish-front">
            <div class="wish-icon">${wish.icon}</div>
            <div class="wish-title">${wish.title}</div>
          </div>
          <div class="wish-back">
            <div class="wish-quote">"${wish.quote}"</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     3. Event Binding & Interactive Handlers
     ------------------------------------------------------------------------ */
  bindEvents() {
    // Secret Opening Enter Button
    document.getElementById('btn-enter-surprise')?.addEventListener('click', () => {
      this.enterMainExperience();
    });

    // Audio Toggle Button
    document.querySelector('.audio-toggle-btn')?.addEventListener('click', () => {
      this.audio.togglePlay();
    });

    // August Calendar Date Click Handler (August 16th Birthday)
    document.getElementById('august-calendar-grid')?.addEventListener('click', (e) => {
      const dateCell = e.target.closest('.calendar-date-cell.birthday-date');
      if (!dateCell) return;

      const title = document.getElementById('calendar-modal-title');
      const body = document.getElementById('calendar-modal-body');

      if (title) title.textContent = "August 16th — The Day My World Changed ❤️";
      if (body) body.textContent = "34 years ago on this very day, August 16th, the most incredible man was born. Out of all the days in history, August 16th will forever be my absolute favorite date.";

      this.audio.playChimeSFX();
      this.particles?.triggerBurst(e.clientX, e.clientY, 100);

      document.getElementById('calendar-modal')?.classList.add('active');
    });

    // Close Calendar Modal
    const closeCalendarModal = () => {
      document.getElementById('calendar-modal')?.classList.remove('active');
    };

    document.getElementById('calendar-modal-close')?.addEventListener('click', closeCalendarModal);
    document.getElementById('calendar-modal-close-btn')?.addEventListener('click', closeCalendarModal);

    // Section 3 - Interactive Gift Box Opening Handler
    const handleGiftOpen = (e) => {
      const visual = document.getElementById('gift-box-visual');
      if (visual) visual.classList.add('opened');

      this.audio.playChimeSFX();
      
      const rect = visual?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : e.clientX;
      const y = rect ? rect.top + rect.height / 2 : e.clientY;
      this.particles?.triggerBurst(x, y, 100);

      setTimeout(() => {
        document.getElementById('gift-reveal-modal')?.classList.add('active');
      }, 600);
    };

    document.getElementById('gift-box')?.addEventListener('click', handleGiftOpen);
    document.getElementById('btn-open-gift')?.addEventListener('click', handleGiftOpen);

    // Gift Reveal Modal Close & Scroll to Memories
    const closeGiftModalAndScroll = () => {
      document.getElementById('gift-reveal-modal')?.classList.remove('active');
      document.getElementById('section-memories')?.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('gift-reveal-close')?.addEventListener('click', closeGiftModalAndScroll);
    document.getElementById('btn-gift-continue')?.addEventListener('click', closeGiftModalAndScroll);

    // Memory Polaroid Click (Photo Modal)
    document.getElementById('memories-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.polaroid-card');
      if (!card) return;
      const memId = parseInt(card.dataset.memoryId);
      const mem = this.data.memories.find(m => m.id === memId);
      if (mem) this.openPhotoModal(mem);
    });

    // Close Photo Modal
    document.getElementById('photo-modal-close')?.addEventListener('click', () => {
      document.getElementById('photo-modal')?.classList.remove('active');
    });

    // Reasons Node Click
    document.getElementById('reasons-grid')?.addEventListener('click', (e) => {
      const node = e.target.closest('.reason-node');
      if (!node) return;

      const index = parseInt(node.dataset.reasonIndex);
      this.unlockedReasonsSet.add(index);
      node.classList.add('unlocked');

      this.updateReasonsCounter();
      this.particles?.triggerBurst(e.clientX, e.clientY, 35);
      this.openReasonModal(index);
    });

    // Close Reason Modal
    document.getElementById('reason-modal-close')?.addEventListener('click', () => {
      document.getElementById('reason-modal')?.classList.remove('active');
    });

    // Wish Card Flip
    document.getElementById('wishes-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.wish-card');
      if (!card) return;
      card.classList.toggle('flipped');
    });

    // Section 9 - Final Surprise & Cake Celebration Trigger
    document.getElementById('btn-final-surprise')?.addEventListener('click', (e) => {
      this.audio.playChimeSFX();
      this.particles?.triggerMetamorphosis();
      
      const overlay = document.getElementById('final-reveal-overlay');
      overlay?.classList.add('active');
    });

    // Blow Out Candles & Grand Full-Screen Pop-Up Trigger
    const triggerBirthdayCelebration = (e) => {
      // Extinguish candle flames
      document.querySelectorAll('.flame').forEach(f => f.classList.add('extinguished'));

      // Play SFX & trigger grand metamorphosis & fireworks burst
      this.audio.playChimeSFX();
      this.particles?.triggerMetamorphosis();

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const rx = Math.random() * window.innerWidth;
          const ry = Math.random() * (window.innerHeight * 0.7);
          this.particles?.triggerBurst(rx, ry, 80);
        }, i * 180);
      }

      // Update button text
      const blowBtn = document.getElementById('btn-blow-candles');
      if (blowBtn) {
        blowBtn.innerHTML = '✨ Wish Granted! Happy 34th Birthday, My Love! 🎉';
        blowBtn.style.background = 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)';
        blowBtn.style.color = '#080608';
      }

      // Show Full-Screen Grand Birthday Pop-Up Overlay
      setTimeout(() => {
        document.getElementById('grand-birthday-popup')?.classList.add('active');
      }, 500);
    };

    document.getElementById('birthday-cake-trigger')?.addEventListener('click', triggerBirthdayCelebration);
    document.getElementById('btn-blow-candles')?.addEventListener('click', triggerBirthdayCelebration);

    // Close Grand Birthday Pop-Up
    const closeGrandPopup = () => {
      document.getElementById('grand-birthday-popup')?.classList.remove('active');
    };

    document.getElementById('grand-popup-close')?.addEventListener('click', closeGrandPopup);
    document.getElementById('grand-popup-close-btn')?.addEventListener('click', closeGrandPopup);

    // Navigation Smooth Active Links
    window.addEventListener('scroll', () => this.handleScrollHighlight());
  }

  openPhotoModal(mem) {
    const modal = document.getElementById('photo-modal');
    const img = document.getElementById('photo-modal-img');
    const caption = document.getElementById('photo-modal-caption');
    const note = document.getElementById('photo-modal-note');

    if (!modal) return;
    img.src = mem.image;
    caption.textContent = mem.caption;
    note.textContent = mem.note;

    modal.classList.add('active');
  }

  openReasonModal(index) {
    const modal = document.getElementById('reason-modal');
    const num = document.getElementById('reason-modal-num');
    const text = document.getElementById('reason-modal-text');

    if (!modal) return;
    num.textContent = `#${index + 1}`;
    text.textContent = `"${this.data.reasons[index]}"`;

    modal.classList.add('active');
  }

  handleScrollHighlight() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSectionId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 200;
      if (window.scrollY >= top) {
        currentSectionId = sec.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }
}

// Instantiate App
new BirthdayApp();
