import { useEffect, useState, type ReactNode } from "react";
import type { Hotspot } from "@/game/types";

export interface Node { x: number; y: number; d: number }
export interface Celebration { id: string; n: number }

interface Props {
  theme: string;
  image: string;
  alt: string;
  hotspots: Hotspot[];
  solved: string[];
  puzzleOrder: string[];
  nodes: Node[];
  exitId: string;
  phase: number;
  celebrate: Celebration | null;
  /** Realm-specific solve animation for the solved object and its node. */
  renderCelebration: (spot: Hotspot, node: Node | undefined) => ReactNode;
  /** Realm-specific ambient layer and completion sequence. */
  renderScene: (p: { phase: number; solvedCount: number; active: boolean; puzzleSpots: Hotspot[] }) => ReactNode;
  exitLabel: (allSolved: boolean) => string;
  onPuzzle: (id: string) => void;
  onExit: () => void;
  onInspect: (text: string) => void;
}

/** Generic interactive room used by every realm after the dungeon. */
export function SceneRoom(p: Props) {
  const [effect, setEffect] = useState<{ id: string; n: number } | null>(null);
  const [visits, setVisits] = useState<Record<string, number>>({});
  const [active, setActive] = useState<Celebration | null>(null);
  const solvedCount = p.puzzleOrder.filter((id) => p.solved.includes(id)).length;
  const allSolved = solvedCount === p.puzzleOrder.length;

  useEffect(() => {
    if (!p.celebrate) return;
    setActive(p.celebrate);
    const t = window.setTimeout(() => setActive(null), 2400);
    return () => window.clearTimeout(t);
  }, [p.celebrate]);

  const click = (h: Hotspot) => {
    if (h.puzzleId) return p.onPuzzle(h.puzzleId);
    if (h.id === p.exitId) return p.onExit();
    const n = visits[h.id] ?? 0;
    setVisits({ ...visits, [h.id]: n + 1 });
    if (h.lines?.length) p.onInspect(h.lines[n % h.lines.length]!);
    setEffect({ id: h.id, n: (effect?.n ?? 0) + 1 });
  };

  const spot = active ? p.hotspots.find((h) => h.puzzleId === active.id) : undefined;
  const node = active ? p.nodes[p.puzzleOrder.indexOf(active.id)] : undefined;
  const puzzleSpots = p.hotspots.filter((h) => h.puzzleId);

  return (
    <div className={`realm-${p.theme} relative mx-auto aspect-[1920/1088] w-[min(100vw,calc((100svh-4.5rem)*1920/1088))] select-none overflow-hidden`}>
      <img src={p.image} alt={p.alt} width={1920} height={1088} className="absolute inset-0 h-full w-full" draggable={false} />

      {p.renderScene({ phase: p.phase, solvedCount, active: !!active, puzzleSpots })}

      {p.nodes.map((n, i) => {
        const pid = p.puzzleOrder[i] ?? "";
        const locking = active?.id === pid;
        return (
          <span
            key={locking ? `${i}-${active!.n}` : i}
            className={`realm-node ${locking ? "realm-node-lock" : ""} ${p.phase === 1 ? "realm-node-sync" : ""}`}
            data-lit={p.solved.includes(pid)}
            style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${n.d}%` }}
            aria-hidden
          />
        );
      })}

      {active && spot && (
        <div key={active.n} className="pointer-events-none absolute inset-0">
          {p.renderCelebration(spot, node)}
        </div>
      )}

      {p.hotspots.map((h) => {
        const isPuzzle = !!h.puzzleId;
        const isSolved = isPuzzle && p.solved.includes(h.puzzleId!);
        const animate = effect?.id === h.id;
        const isExit = h.id === p.exitId;
        return (
          <button
            key={animate ? `${h.id}-${effect!.n}` : h.id}
            type="button"
            className={`hotspot ${isPuzzle || (isExit && allSolved) ? "hotspot-puzzle" : ""} ${animate && h.effect === "wiggle" ? "anim-wiggle" : ""}`}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
            onClick={() => click(h)}
            disabled={p.phase > 0}
            aria-label={isPuzzle ? `${h.label} — puzzle${isSolved ? " (solved)" : ""}` : h.label}
          >
            <span className={`hotspot-label ${h.labelBelow ? "hotspot-label-below" : ""}`}>
              {h.label}
              {isPuzzle && (isSolved ? " · solved" : " · puzzle")}
              {isExit && ` · ${p.exitLabel(allSolved)}`}
            </span>
            {isPuzzle && <span className="puzzle-marker" data-solved={isSolved} />}
            {animate && h.effect === "flare" && <span className="realm-flare anim-flash" style={{ inset: "-40%" }} />}
          </button>
        );
      })}
    </div>
  );
}

/** Points along a quadratic curve from a to b, for energy trails. */
export function trail(a: { x: number; y: number }, b: { x: number; y: number }, count: number, bend = { x: 0, y: 12 }) {
  const cx = (a.x + b.x) / 2 + bend.x, cy = Math.max(a.y, b.y) + bend.y;
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return { t, x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * cx + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * cy + t * t * b.y };
  });
}
