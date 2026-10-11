import type { Hotspot, PuzzleDef } from "./types";
import type { Sfx } from "./audio";
import { DUNGEON_HOTSPOTS, DUNGEON_PUZZLES } from "./puzzles/dungeon";
import { SKY_HOTSPOTS, SKY_PUZZLES } from "./puzzles/sky";

/** One step of a realm's completion sequence. Phase 5 is always "done". */
export interface SequenceStep {
  phase: 1 | 2 | 3 | 4 | 5;
  at: number; // ms from start
  sfx?: Sfx;
  line?: string;
}

/** Everything the play screen needs to run a realm, independent of its artwork. */
export interface RealmDef {
  id: string;
  puzzles: PuzzleDef[];
  hotspots: Hotspot[];
  exitId: string;
  intro: string;
  sealed: (solved: number) => string;
  solvedLine: (solved: number) => string;
  readyLine: string;
  timeline: SequenceStep[];
  skipLine: string;
  doneTitle: string;
  help: string[];
}

export const REALMS: Record<string, RealmDef> = {
  dungeon: {
    id: "dungeon",
    puzzles: DUNGEON_PUZZLES,
    hotspots: DUNGEON_HOTSPOTS,
    exitId: "gate",
    intro: "A sealed gate. Three empty rune sockets. Explore the chamber — some objects hide puzzles.",
    sealed: (n) => `The gate is sealed. ${n} of 3 rune sockets glow. Solve the remaining puzzles to power it.`,
    solvedLine: (n) => (n >= 3 ? "All three sockets blaze with light. The gate is ready — click it to escape!" : `A rune socket on the gate flares to life. ${n} of 3 powered.`),
    readyLine: "The tablet, chest and crystal answer one another…",
    timeline: [
      { phase: 1, at: 0, sfx: "mechanism" },
      { phase: 2, at: 900, sfx: "unlock", line: "Runes race across the gate, burning cyan and violet." },
      { phase: 3, at: 2400, sfx: "gate", line: "The stone shudders. Dust rains from the arch…" },
      { phase: 4, at: 3400, line: "The doors grind apart — light pours in from a city high in the clouds." },
      { phase: 5, at: 6000 },
    ],
    skipLine: "The gate swings open. Beyond it: the Sky Tower.",
    doneTitle: "The gate is open!",
    help: ["Solve each puzzle to light one rune socket on the gate.", "When all three sockets glow, click the gate to escape."],
  },
  "sky-tower": {
    id: "sky-tower",
    puzzles: SKY_PUZZLES,
    hotspots: SKY_HOTSPOTS,
    exitId: "portal",
    intro: "A transit ring stands dormant above the clouds. Three of its nodes are dark. Restore the tower's systems.",
    sealed: (n) => `TRANSIT OFFLINE — ${n} of 3 ring nodes online. Restore the remaining systems first.`,
    solvedLine: (n) => (n >= 3 ? "All three ring nodes are online. Activate the transit ring!" : `A ring node powers up. ${n} of 3 systems online.`),
    readyLine: "Lock, circuit and console synchronise — the tower hums in unison…",
    timeline: [
      { phase: 1, at: 0, sfx: "mechanism" },
      { phase: 2, at: 1100, sfx: "unlock", line: "Light races along the floor circuits toward the transit platform." },
      { phase: 3, at: 2400, sfx: "portal", line: "Holographic rings assemble around a point of pure energy…" },
      { phase: 4, at: 4000, line: "The portal stabilises. Through it: an ancient forest at twilight." },
      { phase: 5, at: 6200 },
    ],
    skipLine: "The portal stabilises. Through it: an ancient forest at twilight.",
    doneTitle: "Transit ring online!",
    help: ["Solve each puzzle to bring one ring node online.", "When all three nodes glow, click the transit ring to open the portal."],
  },
};

export const getRealm = (id: string): RealmDef | undefined => REALMS[id];
