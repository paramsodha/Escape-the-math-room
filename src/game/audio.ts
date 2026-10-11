import { REALM_AUDIO, type RealmAudio } from "./realms";

export type Sfx = "click" | "success" | "error" | "hint" | "mechanism" | "unlock" | "gate" | "complete" | "final" | "portal" | "bloom" | "rift" | "cosmic";

interface Spec {
  notes: number[];
  step?: number;
  dur: number;
  gain: number;
  reverb?: number;
  sweep?: number;
  noise?: { dur: number; freq: number; gain: number };
  wave?: OscillatorType; // forces a wave regardless of realm timbre
}

const BASE: Record<Sfx, Spec> = {
  click: { notes: [620], dur: 0.05, gain: 0.05 },
  hint: { notes: [1318, 1760], step: 0.09, dur: 0.6, gain: 0.045, reverb: 0.5 },
  error: { notes: [196, 165], step: 0.12, dur: 0.25, gain: 0.08, wave: "triangle" },
  success: { notes: [659, 784, 988], step: 0.1, dur: 1.2, gain: 0.07, reverb: 0.6 },
  mechanism: { notes: [62], dur: 0.7, gain: 0.22, sweep: 0.55, noise: { dur: 0.35, freq: 180, gain: 0.45 }, wave: "sine" },
  unlock: { notes: [440, 554, 659, 880, 1108], step: 0.13, dur: 1.6, gain: 0.05, reverb: 0.7 },
  gate: { notes: [41, 55], dur: 3, gain: 0.07, noise: { dur: 3, freq: 140, gain: 0.4 }, wave: "triangle" },
  complete: { notes: [523, 659, 784, 1046], step: 0.15, dur: 2.2, gain: 0.06, reverb: 0.7 },
  portal: { notes: [220, 330, 440, 660, 880], step: 0.22, dur: 2.4, gain: 0.05, sweep: 1.5, reverb: 0.7 },
  bloom: { notes: [784, 988, 1175, 1568], step: 0.16, dur: 2, gain: 0.05, reverb: 0.9, noise: { dur: 1.2, freq: 2400, gain: 0.08 } },
  rift: { notes: [55, 82.4, 110], step: 0.3, dur: 3, gain: 0.07, sweep: 2.5, noise: { dur: 2.5, freq: 600, gain: 0.25 } },
  cosmic: { notes: [261.6, 392, 523, 659, 784, 1046], step: 0.25, dur: 4.5, gain: 0.05, reverb: 1 },
  final: { notes: [392, 523, 659, 784, 1046, 1318], step: 0.18, dur: 3.5, gain: 0.06, reverb: 0.9 },
};

interface Track {
  realm: string;
  stop: () => void;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicBus!: GainNode;
  private duckBus!: GainNode;
  private sfxBus!: GainNode;
  private musicVerb!: ConvolverNode;
  private sfxVerb!: ConvolverNode;
  private track: Track | null = null;
  private realm = "dungeon";
  private vol = { music: 0.5, sfx: 0.7 };
  private unlockBound = false;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
      const c = this.ctx;
      this.musicBus = c.createGain();
      this.duckBus = c.createGain();
      this.sfxBus = c.createGain();
      this.musicBus.gain.value = this.vol.music;
      this.sfxBus.gain.value = this.vol.sfx;
      this.duckBus.connect(this.musicBus).connect(c.destination);
      this.sfxBus.connect(c.destination);
      this.musicVerb = this.makeVerb(3.5);
      this.musicVerb.connect(this.duckBus);
      this.sfxVerb = this.makeVerb(2);
      this.sfxVerb.connect(this.sfxBus);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {});
      if (!this.unlockBound) {
        this.unlockBound = true;
        const resume = () => void this.ctx?.resume();
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      }
    }
    return this.ctx;
  }

  private makeVerb(seconds: number) {
    const c = this.ctx!;
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    const v = c.createConvolver();
    v.buffer = buf;
    return v;
  }

  configure(v: { music: number; sfx: number }) {
    this.vol = v;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.musicBus.gain.setTargetAtTime(v.music, t, 0.15);
    this.sfxBus.gain.setTargetAtTime(v.sfx, t, 0.05);
  }

  duck(on: boolean) {
    if (!this.ctx) return;
    this.duckBus.gain.setTargetAtTime(on ? 0.3 : 1, this.ctx.currentTime, 0.4);
  }

  playMusic(realm: string) {
    this.realm = realm;
    if (this.track?.realm === realm) return; // never restart/overlap the same track
    this.stopMusic();
    const c = this.ensure();
    const cfg: RealmAudio | undefined = REALM_AUDIO[realm];
    if (!c || !cfg) return;
    this.track = this.startTheme(c, realm, cfg);
  }

  stopMusic() {
    this.track?.stop();
    this.track = null;
  }

  private startTheme(c: AudioContext, realm: string, { theme }: RealmAudio): Track {
    const now = c.currentTime;
    const out = c.createGain();
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(1, now + 3); // gentle fade-in
    out.connect(this.duckBus);

    const filt = c.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = theme.filter;
    filt.Q.value = 0.7;
    filt.connect(out);
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = theme.filter * 0.45;
    lfo.connect(lfoGain).connect(filt.frequency);
    lfo.start();

    const oscs: OscillatorNode[] = [lfo];
    theme.droneIntervals.forEach((iv, i) => {
      for (const det of [-6, 6]) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = theme.drone;
        o.frequency.value = theme.root * Math.pow(2, iv / 12);
        o.detune.value = det;
        g.gain.value = 0.06 / (i + 1);
        o.connect(g).connect(filt);
        o.start();
        oscs.push(o);
      }
    });

    let timer: number | undefined;
    const bell = () => {
      const t = c.currentTime;
      const deg = theme.scale[Math.floor(Math.random() * theme.scale.length)] ?? 0;
      const f = theme.root * Math.pow(2, theme.bellOctave + deg / 12 + (Math.random() < 0.3 ? 1 : 0));
      const o = c.createOscillator();
      const g = c.createGain();
      const lp = c.createBiquadFilter();
      lp.frequency.value = 2400;
      o.type = theme.bellWave;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(theme.bellWave === "sine" ? 0.05 : 0.018, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + theme.bellDecay);
      o.connect(lp).connect(g);
      g.connect(out);
      const send = c.createGain();
      send.gain.value = 0.6;
      g.connect(send).connect(this.musicVerb);
      o.start(t);
      o.stop(t + theme.bellDecay + 0.1);
      const [a, b] = theme.bellEvery;
      timer = window.setTimeout(bell, (a + Math.random() * (b - a)) * 1000);
    };
    timer = window.setTimeout(bell, 1500);

    return {
      realm,
      stop: () => {
        window.clearTimeout(timer);
        const t = c.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 1.5); // gentle fade-out
        window.setTimeout(() => {
          oscs.forEach((o) => o.stop());
          out.disconnect();
        }, 1700);
      },
    };
  }

  sfx(name: Sfx) {
    const c = this.ensure();
    if (!c || this.vol.sfx <= 0) return;
    const spec = BASE[name];
    const tb = REALM_AUDIO[this.realm]?.timbre ?? REALM_AUDIO["dungeon"]!.timbre;
    let t = c.currentTime + 0.01;
    const dur = spec.dur * tb.durScale;

    if (spec.noise) {
      const len = Math.floor(c.sampleRate * spec.noise.dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = spec.noise.freq * tb.noiseScale;
      const g = c.createGain();
      g.gain.value = spec.noise.gain;
      src.connect(lp).connect(g).connect(this.sfxBus);
      src.start(t);
    }

    for (const n of spec.notes) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = spec.wave ?? tb.wave;
      const f = n * tb.transpose;
      o.frequency.setValueAtTime(f, t);
      if (spec.sweep) o.frequency.exponentialRampToValueAtTime(f * spec.sweep, t + dur);
      const peak = o.type === "square" || o.type === "sawtooth" ? spec.gain * 0.35 : spec.gain;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.sfxBus);
      if (spec.reverb) {
        const s = c.createGain();
        s.gain.value = spec.reverb;
        g.connect(s).connect(this.sfxVerb);
      }
      o.start(t);
      o.stop(t + dur + 0.05);
      t += spec.step ?? 0;
    }
  }
}

export const audio = new AudioEngine();
