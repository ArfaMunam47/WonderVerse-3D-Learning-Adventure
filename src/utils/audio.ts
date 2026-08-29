// Web Audio API and Speech Synthesis helper for Wonder Meadow
// High quality multi-instrument synthesizer with zero external audio assets

export type InstrumentType = 'piano' | 'drum' | 'xylophone' | 'bells';

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private sfxVolume: number = 0.8;
  private narrationEnabled: boolean = true;
  public isSpeaking: boolean = false;
  private currentSongTimeouts: NodeJS.Timeout[] = [];

  constructor() {
    // Lazy initialize on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSettings(soundEnabled: boolean, sfxVolume: number, narrationEnabled: boolean) {
    this.soundEnabled = soundEnabled;
    this.sfxVolume = Math.max(0, Math.min(1, sfxVolume));
    this.narrationEnabled = narrationEnabled;
    if (!soundEnabled) {
      this.stopSong();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  // Soft wooden tap sound for UI buttons
  public playPop() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.28 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // Audio context catch
    }
  }

  // Sparkling ascending chime for discoveries & star rewards
  public playSparkle() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  // Warm celebratory success chord
  public playSuccess() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
    chord.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.65);
    });
  }

  // Musical Note Scale Frequencies (C4 to C5)
  private readonly scaleFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

  // Play musical instrument sound (Piano, Drum, Xylophone, Bells)
  public playInstrumentSound(noteIndex: number, instrument: InstrumentType = 'xylophone') {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const safeIndex = Math.max(0, Math.min(this.scaleFreqs.length - 1, noteIndex));
    const freq = this.scaleFreqs[safeIndex];
    const now = this.ctx.currentTime;

    try {
      if (instrument === 'piano') {
        // Multi-harmonic warm acoustic piano
        [1, 2, 3].forEach((mult, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq * mult, now);

          const weight = idx === 0 ? 0.35 : 0.15 / mult;
          gain.gain.setValueAtTime(weight * this.sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.15);
        });
      } else if (instrument === 'drum') {
        // Percussive kick + tuned tom tap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startFreq = (freq * 0.45) + 60;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

        gain.gain.setValueAtTime(0.45 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (instrument === 'bells') {
        // Shimmering metallic bell chime
        [1, 2.76, 5.4].forEach((mult, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * 1.5 * mult, now);

          const vol = (idx === 0 ? 0.25 : 0.1) * this.sfxVolume;
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.45);
        });
      } else {
        // Xylophone: bright rounded resonant bar
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch {
      // Catch AudioContext issues gracefully
    }
  }

  // Backwards compatibility for musical note
  public playMusicalNote(noteIndex: number) {
    this.playInstrumentSound(noteIndex, 'xylophone');
  }

  // Phonics bubble pop with pitch shift
  public playBubblePop(pitchShift = 1) {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 420 * pitchShift;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.28 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Audio catch
    }
  }

  // Cheerful animal synthesized chirps and tones
  public playAnimalSound(animalName?: string) {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (animalName === 'duck') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
      } else if (animalName === 'frog') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);
      }

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Catch issues gracefully
    }
  }

  // Stop any active scheduled nursery song
  public stopSong() {
    this.currentSongTimeouts.forEach(t => clearTimeout(t));
    this.currentSongTimeouts = [];
  }

  // Polite, cute anime/cartoon child voice narration
  public speakCuteAnimeChild(text = "Hey, let's explore!", force = true, onEnd?: () => void) {
    if ((!this.soundEnabled && !force) || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterance
      const utterance = new SpeechSynthesisUtterance(text);
      // High pitch and cheerful cadence for cute anime/cartoon child voice
      utterance.pitch = 1.45;
      utterance.rate = 1.05;

      const voices = window.speechSynthesis.getVoices();
      // Look for natural, cheerful, higher-pitched feminine or kid voices
      const preferred = voices.find(v => (
        v.lang.startsWith('en') && (
          v.name.includes('Victoria') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google US English') ||
          v.name.includes('Zira') ||
          v.name.includes('Karen') ||
          v.name.includes('Flo') ||
          v.name.includes('Natural') ||
          v.name.includes('Female')
        )
      )) || voices.find(v => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      this.isSpeaking = true;
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  // Friendly encouragement / Text to Speech narration
  public speak(text: string, force = false, onEnd?: () => void) {
    if ((!this.narrationEnabled && !force) || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.90; // Gentle, clear speed for early learning
      utterance.pitch = 1.12; // Warm, friendly pitch

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => (
        v.lang.startsWith('en') && (
          v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen')
        )
      ));
      if (preferred) {
        utterance.voice = preferred;
      }

      this.isSpeaking = true;
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const audioService = new AudioManager();
