/* ==========================================================================
   AUDIO CONTROLLER & SYNTHESIZER ENGINE
   Handles background music, sound effects, and Web Audio API synthesizer fallback
   ========================================================================== */

export class AudioController {
  constructor(audioSrc) {
    this.audioSrc = audioSrc || 'assets/music/birthday-song.mp3';
    this.audio = new Audio();
    this.isPlaying = false;
    this.isMuted = false;
    this.synthContext = null;
    this.isUsingSynthFallback = false;
    this.synthNodes = [];

    this.initAudio();
  }

  initAudio() {
    this.audio.src = this.audioSrc;
    this.audio.loop = true;
    this.audio.volume = 0.5;

    // Detect if MP3 fails to load, fallback to Web Audio Synthesizer
    this.audio.addEventListener('error', () => {
      console.log('Local MP3 file not found at assets/music/birthday-song.mp3. Activating procedural romantic Web Audio synthesizer fallback.');
      this.isUsingSynthFallback = true;
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.isUsingSynthFallback) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.updateUI();
      }).catch(err => {
        console.warn('HTML5 Audio playback blocked or missing file. Switching to Web Audio Synth fallback.');
        this.isUsingSynthFallback = true;
        this.startSynth();
      });
    } else {
      this.startSynth();
    }
  }

  pause() {
    if (!this.isUsingSynthFallback) {
      this.audio.pause();
    } else if (this.synthContext) {
      this.synthContext.suspend();
    }
    this.isPlaying = false;
    this.updateUI();
  }

  updateUI() {
    const btn = document.querySelector('.audio-toggle-btn');
    if (!btn) return;
    if (this.isPlaying) {
      btn.classList.add('playing');
      btn.querySelector('.audio-status-text').textContent = 'Music Playing';
    } else {
      btn.classList.remove('playing');
      btn.querySelector('.audio-status-text').textContent = 'Music Muted';
    }
  }

  // Web Audio API Synthesizer (Generates a warm, ambient romantic melody)
  startSynth() {
    if (!this.synthContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.synthContext = new AudioCtx();
    }

    if (this.synthContext.state === 'suspended') {
      this.synthContext.resume();
    }

    this.isPlaying = true;
    this.updateUI();

    // Play soft ambient pentatonic chord progression (A-major / C#-minor romantic pad)
    const frequencies = [220, 277.18, 329.63, 440, 554.37];
    let chordIndex = 0;

    const playChord = () => {
      if (!this.isPlaying) return;

      const osc = this.synthContext.createOscillator();
      const gain = this.synthContext.createGain();

      osc.type = 'sine';
      const rootFreq = frequencies[chordIndex % frequencies.length];
      osc.frequency.setValueAtTime(rootFreq, this.synthContext.currentTime);

      gain.gain.setValueAtTime(0, this.synthContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.synthContext.currentTime + 2);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.synthContext.currentTime + 5);

      osc.connect(gain);
      gain.connect(this.synthContext.destination);

      osc.start();
      osc.stop(this.synthContext.currentTime + 5.5);

      chordIndex++;
      if (this.isPlaying) {
        setTimeout(playChord, 3500);
      }
    };

    playChord();
  }

  // Sound Effect: Magical Chime for Gift Box
  playChimeSFX() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 1.3);
      });
    } catch (e) {
      // Audio context fallback ignore
    }
  }
}
