/**
 * audio.js
 * ---------------------------------------------------------------------------
 * Two responsibilities:
 *   1. AudioEngine   - procedurally generated background music + sound
 *                      effects using the Web Audio API (no external audio
 *                      files needed, so the game has zero load time for sound).
 *   2. SpeechManager - wraps the Web Speech API (SpeechSynthesis) to narrate
 *                      object names, letters, and encouragements in a warm,
 *                      slow, child-friendly voice. Every spoken line is also
 *                      shown as an on-screen caption bubble for children who
 *                      are deaf/hard of hearing or for quiet environments.
 * ---------------------------------------------------------------------------
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.musicNodes = [];
    this.musicPlaying = false;
    this.settings = {
      musicVolume: 0.35,
      sfxVolume: 0.7,
      muted: false
    };
  }

  // Web Audio requires a user gesture before starting - call this on first tap.
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.settings.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.settings.sfxVolume;
    this.sfxGain.connect(this.masterGain);
  }

  setMusicVolume(v) {
    this.settings.musicVolume = v;
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  setSfxVolume(v) {
    this.settings.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  setMuted(muted) {
    this.settings.muted = muted;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
  }

  /* --------------------------- Ambient background music ------------------ */
  // A gentle, looping pentatonic pad + soft arpeggio - calming, non-repetitive
  // feeling, no jarring notes. Designed to be safe for sensory-sensitive kids.
  startMusic() {
    if (!this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00];

    const playPad = () => {
      if (!this.musicPlaying) return;
      const base = pentatonic[Math.floor(Math.random() * pentatonic.length)] / 2;
      [1, 1.5, 2].forEach((mult, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = base * mult;
        g.gain.value = 0;
        osc.connect(g).connect(this.musicGain);
        const now = this.ctx.currentTime;
        g.gain.linearRampToValueAtTime(0.12 / (i + 1), now + 3);
        g.gain.linearRampToValueAtTime(0, now + 7);
        osc.start(now);
        osc.stop(now + 7.2);
      });
      this._musicTimer = setTimeout(playPad, 4000 + Math.random() * 2000);
    };
    playPad();

    const playArp = () => {
      if (!this.musicPlaying) return;
      const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = note;
      g.gain.value = 0;
      osc.connect(g).connect(this.musicGain);
      const now = this.ctx.currentTime;
      g.gain.linearRampToValueAtTime(0.06, now + 0.15);
      g.gain.linearRampToValueAtTime(0, now + 1.6);
      osc.start(now);
      osc.stop(now + 1.7);
      this._arpTimer = setTimeout(playArp, 1800 + Math.random() * 2200);
    };
    playArp();
  }

  stopMusic() {
    this.musicPlaying = false;
    clearTimeout(this._musicTimer);
    clearTimeout(this._arpTimer);
  }

  /* ------------------------------- SFX helpers ---------------------------- */
  _tone(freq, duration, type = "sine", gainPeak = 0.3, glideTo = null) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, this.ctx.currentTime + duration);
    g.gain.value = 0;
    osc.connect(g).connect(this.sfxGain);
    const now = this.ctx.currentTime;
    g.gain.linearRampToValueAtTime(gainPeak, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playPop() {
    this._tone(600, 0.15, "sine", 0.35, 1400);
  }

  playChime() {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((f, i) => setTimeout(() => this._tone(f, 0.5, "sine", 0.2), i * 90));
  }

  playSparkle() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this._tone(1200 + Math.random() * 900, 0.18, "sine", 0.12), i * 45);
    }
  }

  playNote(freq) {
    this._tone(freq, 0.6, "triangle", 0.28);
  }

  playSuccess() {
    const notes = [392.0, 523.25, 659.25, 783.99];
    notes.forEach((f, i) => setTimeout(() => this._tone(f, 0.35, "triangle", 0.22), i * 110));
  }

  playFlutter() {
    // gentle rising twinkle for stars / butterflies
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this._tone(700 + i * 120, 0.2, "sine", 0.15), i * 70);
    }
  }

  playRain() {
    // soft filtered noise burst for cloud-rain interaction
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    const g = this.ctx.createGain();
    g.gain.value = 0.15;
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start();
  }
}

/* =============================================================================
   Speech narration - reads object names aloud and shows matching captions.
============================================================================= */
class SpeechManager {
  constructor() {
    this.enabled = true;
    this.rate = 0.85;     // slightly slow, calm pace for young learners
    this.pitch = 1.15;    // warm, friendly pitch
    this.volume = 1.0;
    this.voice = null;
    this.captionEl = document.getElementById("caption-bubble");
    this._loadVoice();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this._loadVoice();
    }
  }

  _loadVoice() {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer a friendly-sounding English voice if available
    this.voice =
      voices.find(v => /female|samantha|victoria|zira|karen/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find(v => /en/i.test(v.lang)) ||
      voices[0] || null;
  }

  speak(text, { caption = true } = {}) {
    if (!this.enabled || !window.speechSynthesis) {
      if (caption) this.showCaption(text);
      return;
    }
    window.speechSynthesis.cancel(); // never queue/stack - stay calm, one line at a time
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = this.rate;
    utter.pitch = this.pitch;
    utter.volume = this.volume;
    if (this.voice) utter.voice = this.voice;
    window.speechSynthesis.speak(utter);
    if (caption) this.showCaption(text);
  }

  showCaption(text) {
    if (!this.captionEl) return;
    this.captionEl.textContent = text;
    this.captionEl.classList.add("visible");
    clearTimeout(this._captionTimer);
    this._captionTimer = setTimeout(() => {
      this.captionEl.classList.remove("visible");
    }, 2600);
  }

  encourage() {
    const lines = GAME_DATA.encouragements;
    const line = lines[Math.floor(Math.random() * lines.length)];
    this.speak(line, { caption: true });
  }
}
