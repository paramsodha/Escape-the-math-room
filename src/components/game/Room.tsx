import { useEffect, useState } from "react";
import type { Hotspot } from "@/game/types";

/** Stone-gate sequence phases: 0 idle · 1 resonate · 2 runes · 3 shake · 4 open · 5 done */
export type GatePhase = 0 | 1 | 2 | 3 | 4 | 5;

interface Props {
  image: string;
  revealImage: string;
  hotspots: Hotspot[];
  solved: string[];
  sockets: { x: number; y: number; d: number }[];
  puzzleOrder: string[];
  gate: { x: number; y: number; w: number; h: number };
  phase: GatePhase;
  /** Puzzle id whose solve animation should play now (set once by the parent). */
  celebrate: { id: string; n: number } | null;
  onPuzzle: (id: string) => void;
  onGate: () => void;
  onInspect: (text: string) => void;
}

const DUST = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  top: 40 + ((i * 23) % 55),
  dur: 7 + (i % 5) * 2,
  delay: (i * 1.3) % 9,
}));
const GLYPHS = ["ᚠ", "ᚱ", "ᛟ", "∩", "∪", "∂", "ᛉ", "∑", "ᚹ", "∈", "ᛞ", "∀", "ᛗ", "⊂"];
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const r = 50 + (i % 3) * 25;
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r - 20, delay: (i % 4) * 0.05, violet: i % 3 === 0 };
});
const GATE_RUNES = Array.from({ length: 14 }, (_, i) => {
  const a = Math.PI + (i / 13) * Math.PI; // arc across the top half
  return { x: 50 + Math.cos(a) * 40, y: 52 + Math.sin(a) * 40, g: GLYPHS[i % GLYPHS.length]! };
});
const GATE_DUST = Array.from({ length: 16 }, (_, i) => ({ left: 5 + ((i * 29) % 90), delay: (i % 6) * 0.12, fall: 60 + (i % 4) * 40 }));

export function Room({ image, revealImage, hotspots, solved, sockets, puzzleOrder, gate, phase, celebrate, onPuzzle, onGate, onInspect }: Props) {
  const [effect, setEffect] = useState<{ id: string; n: number } | null>(null);
  const [visits, setVisits] = useState<Record<string, number>>({});
  const [active, setActive] = useState<{ id: string; n: number } | null>(null);
  const allSolved = puzzleOrder.every((p) => solved.includes(p));

  // Run each solve celebration once, then clear it.
  useEffect(() => {
    if (!celebrate) return;
    setActive(celebrate);
    const t = window.setTimeout(() => setActive(null), 2400);
    return () => window.clearTimeout(t);
  }, [celebrate]);

  const click = (h: Hotspot) => {
    if (h.puzzleId) return onPuzzle(h.puzzleId);
    if (h.id === "gate") return onGate();
    const n = visits[h.id] ?? 0;
    setVisits({ ...visits, [h.id]: n + 1 });
    if (h.lines?.length) onInspect(h.lines[n % h.lines.length]!);
    setEffect({ id: h.id, n: (effect?.n ?? 0) + 1 });
  };

  const half = gate.w / 2;
  const slice = (left: number) => ({
    backgroundImage: `url(${image})`,
    backgroundSize: `${(100 / half) * 100}% ${(100 / gate.h) * 100}%`,
    backgroundPosition: `${(left / (100 - half)) * 100}% ${(gate.y / (100 - gate.h)) * 100}%`,
  });

  const activeSpot = active ? hotspots.find((h) => h.puzzleId === active.id) : undefined;
  const activeSocket = active ? sockets[puzzleOrder.indexOf(active.id)] : undefined;
  const flare = !!active || phase >= 1;
  const puzzleSpots = hotspots.filter((h) => h.puzzleId);

  return (
    <div className={`relative mx-auto aspect-[1920/1088] w-[min(100vw,calc((100svh-4.5rem)*1920/1088))] select-none overflow-hidden ${active ? "stone-thud" : ""}`}>
      <img src={image} alt="The Forgotten Dungeon: a rune-sealed stone gate between torches, a carved tablet, a treasure chest and a crystal altar" width={1920} height={1088} className="absolute inset-0 h-full w-full" draggable={false} />

      {/* Ambient lighting */}
      <div className={`torch-glow ${flare ? "flare-burst" : ""}`} style={{ left: "-2%", top: "14%", width: "14%", height: "26%" }} />
      <div className={`torch-glow ${flare ? "flare-burst" : ""}`} style={{ left: "16%", top: "25%", width: "12%", height: "22%", animationDelay: "0.8s" }} />
      <div className="crystal-glow" style={{ left: "76%", top: "30%", width: "18%", height: "34%", opacity: 0.5 + solved.length * 0.17, filter: active || phase >= 1 ? "brightness(1.6)" : undefined }} />
      {DUST.map((d, i) => (
        <span key={i} className="dust" style={{ left: `${d.left}%`, top: `${d.top}%`, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />
      ))}

      {/* Gate: reveal (Sky Tower) behind sliding doors */}
      <div className={`absolute overflow-hidden ${phase === 3 ? "gate-shake" : ""}`} style={{ left: `${gate.x}%`, top: `${gate.y}%`, width: `${gate.w}%`, height: `${gate.h}%`, borderRadius: "50% 50% 0 0 / 22% 22% 0 0" }}>
        {phase >= 3 && (
          <>
            <img src={revealImage} alt={phase >= 4 ? "Through the gate: the glowing Sky Tower" : ""} className="absolute inset-0 h-full w-full object-cover" />
            <div className={`exit-light absolute inset-0 transition-opacity duration-[2000ms] ${phase >= 4 ? "opacity-50" : "opacity-0"}`} />
            <div className="door-half absolute inset-y-0 left-0 w-1/2" style={{ ...slice(gate.x), transform: phase >= 4 ? "translateX(-102%)" : "none" }} />
            <div className="door-half absolute inset-y-0 right-0 w-1/2" style={{ ...slice(gate.x + half), transform: phase >= 4 ? "translateX(102%)" : "none" }} />
          </>
        )}
        {phase >= 2 && phase < 5 &&
          GATE_RUNES.map((r, i) => (
            <span key={i} className={`rune-glyph rune-glyph-hold ${i % 3 === 1 ? "rune-glyph-violet" : ""}`} style={{ left: `${r.x}%`, top: `${r.y}%`, fontSize: "clamp(0.8rem, 1.6vw, 1.5rem)", animationDelay: `${i * 0.08}s`, opacity: phase >= 4 ? 0 : undefined, transition: "opacity 1s" }}>
              {r.g}
            </span>
          ))}
        {phase === 3 && GATE_DUST.map((d, i) => <span key={i} className="dust-mote" style={{ left: `${d.left}%`, top: "2%", animationDelay: `${d.delay}s`, ["--fall" as string]: `${d.fall}px` }} />)}
      </div>

      {/* Light beam spilling out of the opened gate */}
      {phase >= 4 && <div className="light-beam" style={{ left: `${gate.x - 4}%`, top: `${gate.y + gate.h - 2}%`, width: `${gate.w + 8}%`, height: `${100 - gate.y - gate.h + 2}%` }} />}
      {phase === 2 && <span className="energy-ring" style={{ left: `${gate.x + gate.w / 2 - 12}%`, top: `${gate.y + 5}%`, width: "24%", aspectRatio: "1" }} />}

      {allSolved && phase === 0 && <div className="crystal-glow" style={{ left: `${gate.x + gate.w / 2 - 6}%`, top: `${gate.y + 18}%`, width: "12%", height: "22%" }} />}
      {phase >= 2 && phase < 5 && (
        <>
          <div className="crystal-glow" style={{ left: `${gate.x - 6}%`, top: `${gate.y + 10}%`, width: "10%", height: "60%" }} />
          <div className="crystal-glow" style={{ left: `${gate.x + gate.w - 4}%`, top: `${gate.y + 10}%`, width: "10%", height: "60%" }} />
        </>
      )}

      {/* Rune sockets */}
      {sockets.map((s, i) => {
        const pid = puzzleOrder[i] ?? "";
        const locking = active?.id === pid;
        return (
          <span
            key={locking ? `${i}-${active!.n}` : i}
            className={`socket aspect-square ${locking ? "socket-lock" : ""} ${phase === 1 ? "socket-resonate" : ""}`}
            data-lit={solved.includes(pid)}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.d}%` }}
            aria-hidden
          />
        );
      })}

      {/* Solve celebration: runes ignite on the object, energy travels to the gate socket */}
      {active && activeSpot && (
        <div key={active.n} className="pointer-events-none absolute inset-0">
          <span className="solve-surge" style={{ left: `${activeSpot.x}%`, top: `${activeSpot.y}%`, width: `${activeSpot.w}%`, height: `${activeSpot.h}%` }} />
          {GLYPHS.slice(0, 6).map((g, i) => (
            <span
              key={i}
              className={`rune-glyph ${i % 2 ? "rune-glyph-violet" : ""}`}
              style={{ left: `${activeSpot.x + activeSpot.w * (0.2 + (i % 3) * 0.3)}%`, top: `${activeSpot.y + activeSpot.h * (0.25 + Math.floor(i / 3) * 0.4)}%`, fontSize: "clamp(0.9rem, 2vw, 1.8rem)", animationDelay: `${i * 0.1}s` }}
            >
              {g}
            </span>
          ))}
          {SPARKS.map((s, i) => (
            <span key={i} className={`spark ${s.violet ? "spark-violet" : ""}`} style={{ left: `${activeSpot.x + activeSpot.w / 2}%`, top: `${activeSpot.y + activeSpot.h / 2}%`, animationDelay: `${s.delay}s`, ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px` }} />
          ))}
          {activeSocket &&
            Array.from({ length: 14 }, (_, i) => {
              const t = i / 13;
              const x0 = activeSpot.x + activeSpot.w / 2, y0 = activeSpot.y + activeSpot.h / 2;
              const x2 = activeSocket.x + activeSocket.d / 2, y2 = activeSocket.y + activeSocket.d * 0.88;
              const cx = 47, cy = activeSpot.y < 30 ? 60 : 30;
              const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x2;
              const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y2;
              return <span key={i} className="energy-orb" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${0.35 + t * 0.9}s` }} />;
            })}
        </div>
      )}

      {/* Phase 1: all three mechanisms resonate together */}
      {phase === 1 && puzzleSpots.map((h) => <span key={h.id} className="solve-surge" style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }} />)}
      {phase === 4 && <div className="exit-light anim-flash pointer-events-none absolute inset-0 opacity-60" />}

      {/* Hotspots */}
      {hotspots.map((h) => {
        const isPuzzle = !!h.puzzleId;
        const isSolved = isPuzzle && solved.includes(h.puzzleId!);
        const animate = effect?.id === h.id;
        return (
          <button
            key={animate ? `${h.id}-${effect!.n}` : h.id}
            type="button"
            className={`hotspot ${isPuzzle || (h.id === "gate" && allSolved) ? "hotspot-puzzle" : ""} ${animate && h.effect === "wiggle" ? "anim-wiggle" : ""}`}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
            onClick={() => click(h)}
            disabled={phase > 0}
            aria-label={isPuzzle ? `${h.label} — puzzle${isSolved ? " (solved)" : ""}` : h.label}
          >
            <span className={`hotspot-label ${h.labelBelow ? "hotspot-label-below" : ""}`}>
              {h.label}
              {isPuzzle && (isSolved ? " · solved" : " · puzzle")}
              {h.id === "gate" && (allSolved ? " · open" : " · sealed")}
            </span>
            {isPuzzle && <span className="puzzle-marker" data-solved={isSolved} />}
            {animate && h.effect === "flare" && <span className="torch-glow anim-flash" style={{ inset: "-60%" }} />}
          </button>
        );
      })}
    </div>
  );
}
