type ToneOptions = {
  frequency?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
};

/**
 * Wraps the Web Audio API for short, procedurally-generated UI sounds —
 * no audio files needed at all, which matters here since this project has
 * none yet. Background music (see AudioManager) is a real audio file and
 * can't be synthesized this way; this only ever covers short tones/chimes.
 *
 * A fresh AudioContext stays suspended until it's resumed from inside a
 * genuine user gesture (a click/tap) — every play method below unlocks
 * the context first for exactly that reason, so callers (HUD's button
 * handlers) never need to think about it themselves.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined' || !window.AudioContext) return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  private unlock(ctx: AudioContext) {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Nothing meaningful to do here — worst case this one tone stays
        // silent, which is a lot better than throwing over it.
      });
    }
  }

  playTone({ frequency = 660, duration = 0.15, type = 'sine', volume = 0.15 }: ToneOptions = {}) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.unlock(ctx);

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Short linear attack, exponential release — avoids the click/pop a
    // hard on/off transition would cause, closer to a soft chime than a
    // beep. Exponential ramps can't target true zero (mathematically
    // undefined for that curve), hence the tiny 0.0001 floor instead of 0.
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration + 0.05);
  }

  /** Neutral click — for actions that switch between named modes rather
   *  than a true on/off (theme, language). */
  playClick() {
    this.playTone({ frequency: 720, duration: 0.08, volume: 0.12 });
  }

  /** Higher pitch reads as "enabling something" — for genuine on/off
   *  toggles (music, stats). */
  playToggleOn() {
    this.playTone({ frequency: 880, duration: 0.12, volume: 0.13 });
  }

  /** Lower pitch reads as "disabling something." */
  playToggleOff() {
    this.playTone({ frequency: 520, duration: 0.12, volume: 0.1 });
  }
}

// One shared instance — a fresh AudioContext per call site would be
// wasteful, and every consumer wants the same unlock-on-first-gesture
// behavior anyway.
export const audioEngine = new AudioEngine();
