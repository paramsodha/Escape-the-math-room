export type DifficultyId = "amateur" | "apprentice" | "challenger" | "expert" | "mastermind" | "legendary";

export type Answer =
  | { kind: "numeric"; value: number; placeholder?: string }
  | { kind: "set"; options: string[]; correct: string[] }
  | { kind: "choice"; options: string[]; correct: number[]; multi: boolean };

export interface PuzzleVariant {
  /** Short story-framed instruction. */
  prompt: string;
  /** Math notation lines, rendered in a math typeface. */
  math: string[];
  /** The actual question being asked. */
  ask: string;
  answer: Answer;
  hints: [string, string, string];
  solution: { steps: string[]; explanation: string };
  /** Optional nudge after a wrong numeric answer. */
  wrongNudge?: string;
}

export interface PuzzleDef {
  id: string;
  title: string;
  topic: string;
  variants: Record<DifficultyId, PuzzleVariant>;
}

export interface Hotspot {
  id: string;
  label: string;
  /** Percent of room width/height. */
  x: number;
  y: number;
  w: number;
  h: number;
  puzzleId?: string;
  /** Inspection lines, cycled on each click. */
  lines?: string[];
  effect?: "wiggle" | "flare";
  labelBelow?: boolean;
}

export interface LevelDef {
  id: string;
  number: number;
  name: string;
  tagline: string;
  description: string;
  image: string;
  playable: boolean;
}
