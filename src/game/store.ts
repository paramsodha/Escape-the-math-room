import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type Settings } from "./settings";
import { LEVELS } from "./levels";

export interface LevelProgress {
  solved: string[];
  assisted: string[];
  completed: boolean;
}

export interface GameState {
  settings: Settings;
  progress: Record<string, LevelProgress>;
  hydrated: boolean;
}

const KEY = "escape-math-room:v1";
const empty = (): LevelProgress => ({ solved: [], assisted: [], completed: false });

const INITIAL: GameState = { settings: DEFAULT_SETTINGS, progress: {}, hydrated: false };
let state: GameState = INITIAL;
const listeners = new Set<() => void>();

function load() {
  if (state.hydrated || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    state = {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      progress: parsed.progress ?? {},
      hydrated: true,
    };
  } catch {
    state = { ...state, hydrated: true };
  }
}

function commit(next: GameState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify({ settings: state.settings, progress: state.progress }));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

export function useGame(): GameState {
  const [snap, setSnap] = useState<GameState>(INITIAL);
  useEffect(() => {
    load();
    setSnap(state);
    const l = () => setSnap(state);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return snap;
}

export function getLevelProgress(s: GameState, id: string): LevelProgress {
  return s.progress[id] ?? empty();
}

export function isUnlocked(s: GameState, levelId: string): boolean {
  const idx = LEVELS.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true;
  return !!s.progress[LEVELS[idx - 1]!.id]?.completed;
}

export const actions = {
  updateSettings(patch: Partial<Settings>) {
    load();
    commit({ ...state, settings: { ...state.settings, ...patch } });
  },
  solvePuzzle(levelId: string, puzzleId: string, assisted: boolean) {
    load();
    const p = state.progress[levelId] ?? empty();
    if (p.solved.includes(puzzleId)) return; // guard duplicate completion
    commit({
      ...state,
      progress: {
        ...state.progress,
        [levelId]: {
          ...p,
          solved: [...p.solved, puzzleId],
          assisted: assisted ? [...p.assisted, puzzleId] : p.assisted,
        },
      },
    });
  },
  completeLevel(levelId: string) {
    load();
    const p = state.progress[levelId] ?? empty();
    if (p.completed) return;
    commit({ ...state, progress: { ...state.progress, [levelId]: { ...p, completed: true } } });
  },
  /** Restart a room: clears puzzle state but keeps completion (so later levels stay unlocked). */
  restartLevel(levelId: string) {
    load();
    const p = state.progress[levelId] ?? empty();
    commit({ ...state, progress: { ...state.progress, [levelId]: { ...p, solved: [], assisted: [] } } });
  },
  resetAll() {
    load();
    commit({ ...state, progress: {} });
  },
};
