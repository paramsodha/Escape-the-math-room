import type { DifficultyId } from "./types";

export const DIFFICULTIES: { id: DifficultyId; label: string; band: string; blurb: string }[] = [
  { id: "amateur", label: "Amateur", band: "Foundational", blurb: "For beginners. Direct, one-step questions you can do in your head." },
  { id: "apprentice", label: "Apprentice", band: "Foundational", blurb: "Introduces basic reasoning: combining two ideas or checking properties." },
  { id: "challenger", label: "Challenger", band: "Intermediate", blurb: "Needs independent thought — complements, closures and limits." },
  { id: "expert", label: "Expert", band: "Intermediate", blurb: "Multi-step reasoning: counting arguments, continuity conditions." },
  { id: "mastermind", label: "Mastermind", band: "Advanced", blurb: "Harder applications: power sets, symmetric relations, stationary points." },
  { id: "legendary", label: "Legendary", band: "Advanced", blurb: "The most demanding mode: three-set counting, partitions, trig limits." },
];

export type TimerOption = "off" | 30 | 60 | 120 | "custom";

export interface Settings {
  difficulty: DifficultyId;
  timer: TimerOption;
  customSeconds: number;
  hints: "unlimited" | "limited";
  calculator: boolean;
  sound: boolean;
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
}

export const LIMITED_HINTS = 1;

export const DEFAULT_SETTINGS: Settings = {
  difficulty: "amateur",
  timer: "off",
  customSeconds: 90,
  hints: "unlimited",
  calculator: true,
  sound: true,
  muted: false,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  reducedMotion: false,
};

export function timerSeconds(s: Settings): number | null {
  if (s.timer === "off") return null;
  if (s.timer === "custom") return Math.min(600, Math.max(10, Math.round(s.customSeconds || 90)));
  return s.timer;
}
