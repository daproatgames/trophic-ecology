type SoundName = 'click' | 'correct' | 'wrong' | 'flip' | 'win' | 'level' | 'tick' | 'select' | 'pop' | 'lose';

class SoundEngine {
  private ctx: AudioContext | null = null;
  enabled = true;

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, duration: number, type: OscillatorType, gain: number, delay = 0, endFreq?: number) {
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const start = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), start + duration);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  play(name: SoundName) {
    if (!this.enabled) return;
    switch (name) {
      case 'click':
        this.tone(520, 0.055, 'triangle', 0.03);
        break;
      case 'select':
        this.tone(660, 0.06, 'sine', 0.035);
        break;
      case 'pop':
        this.tone(880, 0.08, 'sine', 0.03, 0, 1200);
        break;
      case 'correct':
        this.tone(523.25, 0.1, 'sine', 0.06);
        this.tone(659.25, 0.12, 'sine', 0.06, 0.075);
        this.tone(783.99, 0.18, 'sine', 0.055, 0.15);
        break;
      case 'wrong':
        this.tone(180, 0.2, 'sawtooth', 0.035, 0, 110);
        this.tone(120, 0.22, 'sine', 0.04, 0.03, 80);
        break;
      case 'flip':
        this.tone(420, 0.06, 'triangle', 0.03, 0, 620);
        break;
      case 'tick':
        this.tone(1200, 0.03, 'square', 0.012);
        break;
      case 'level':
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.25, 'sine', 0.06, i * 0.09));
        break;
      case 'win':
        [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.055, i * 0.11));
        break;
      case 'lose':
        [330, 294, 262, 196].forEach((f, i) => this.tone(f, 0.25, 'sine', 0.04, i * 0.12));
        break;
    }
  }
}

export const sound = new SoundEngine();