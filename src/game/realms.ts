/**
 * Per-realm audio + animation configuration. Each realm gets its own synthesized
 * music theme, its own sound-effect timbre, and names its own completion sequence.
 * To use real recorded music instead, set `musicUrl` (a licensed file you supply).
 */
export interface MusicTheme {
  root: number; // Hz
  scale: number[]; // semitones
  drone: OscillatorType;
  droneIntervals: number[];
  filter: number;
  bellWave: OscillatorType;
  bellOctave: number;
  bellEvery: [number, number]; // seconds
  bellDecay: number;
}

export interface SfxTimbre {
  wave: OscillatorType;
  transpose: number; // frequency multiplier
  durScale: number;
  noiseScale: number;
}

export interface RealmAudio {
  musicUrl?: string;
  theme: MusicTheme;
  timbre: SfxTimbre;
}

export type CompletionSequence = "stone-gate" | "transit-portal" | "living-passage" | "dimensional-breach" | "cosmic-revelation";

export const REALM_AUDIO: Record<string, RealmAudio> = {
  dungeon: {
    theme: { root: 55, scale: [0, 3, 5, 7, 10], drone: "triangle", droneIntervals: [0, 7, 12], filter: 420, bellWave: "sine", bellOctave: 3, bellEvery: [2.8, 5.5], bellDecay: 3.5 },
    timbre: { wave: "sine", transpose: 1, durScale: 1, noiseScale: 1 },
  },
  "sky-tower": {
    theme: { root: 73.42, scale: [0, 2, 4, 6, 7, 9, 11], drone: "sawtooth", droneIntervals: [0, 7, 14], filter: 900, bellWave: "square", bellOctave: 3, bellEvery: [1.2, 2.6], bellDecay: 0.9 },
    timbre: { wave: "square", transpose: 1.12, durScale: 0.6, noiseScale: 3 },
  },
  forest: {
    theme: { root: 65.41, scale: [0, 2, 4, 7, 9], drone: "sine", droneIntervals: [0, 12, 16], filter: 700, bellWave: "triangle", bellOctave: 3, bellEvery: [1.8, 4], bellDecay: 2.5 },
    timbre: { wave: "triangle", transpose: 1.33, durScale: 1.3, noiseScale: 4 },
  },
  lab: {
    theme: { root: 49, scale: [0, 1, 5, 7, 8], drone: "sawtooth", droneIntervals: [0, 7], filter: 320, bellWave: "square", bellOctave: 4, bellEvery: [0.9, 2], bellDecay: 0.5 },
    timbre: { wave: "sawtooth", transpose: 0.9, durScale: 0.7, noiseScale: 6 },
  },
  paradox: {
    theme: { root: 41.2, scale: [0, 2, 3, 7, 10], drone: "triangle", droneIntervals: [0, 7, 12, 19], filter: 600, bellWave: "sine", bellOctave: 4, bellEvery: [3, 6], bellDecay: 6 },
    timbre: { wave: "sine", transpose: 0.75, durScale: 1.6, noiseScale: 0.7 },
  },
};

export const REALM_SEQUENCE: Record<string, CompletionSequence> = {
  dungeon: "stone-gate",
  "sky-tower": "transit-portal",
  forest: "living-passage",
  lab: "dimensional-breach",
  paradox: "cosmic-revelation",
};
