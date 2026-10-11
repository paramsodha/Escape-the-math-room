import type { Hotspot } from "@/game/types";
import { trail, type Node } from "../SceneRoom";
import { SKY_PLATFORM, SKY_PORTAL } from "@/game/puzzles/sky";

const TWINKLES = Array.from({ length: 16 }, (_, i) => ({ x: 22 + ((i * 41) % 52), y: 30 + ((i * 17) % 22), delay: (i * 0.7) % 5 }));
const HOLO = ["ƒ", "△", "⬡", "∞", "→", "◇"];

/** Sky Tower solve: holographic scan, rotating hexagon lock, data packets to the ring node. */
export function SkyCelebration(spot: Hotspot, node: Node | undefined) {
  const c = { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 };
  return (
    <>
      <span className="sky-scan" style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, height: `${spot.h}%` }} />
      <svg className="sky-hex" viewBox="0 0 100 100" style={{ left: `${c.x}%`, top: `${c.y}%` }} aria-hidden>
        <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" />
        <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" />
      </svg>
      {HOLO.map((g, i) => (
        <span key={i} className="sky-glyph" style={{ left: `${spot.x + spot.w * (0.15 + (i % 3) * 0.35)}%`, top: `${spot.y + spot.h * (0.2 + Math.floor(i / 3) * 0.5)}%`, animationDelay: `${i * 0.08}s` }}>{g}</span>
      ))}
      {node && trail(c, { x: node.x + node.d / 2, y: node.y + node.d }, 16, { x: 0, y: 10 }).map((pt, i) => (
        <span key={i} className="sky-packet" style={{ left: `${pt.x}%`, top: `${pt.y}%`, animationDelay: `${0.4 + pt.t * 0.9}s` }} />
      ))}
    </>
  );
}

/** Sky Tower ambience + quantum transit portal sequence. */
export function SkyScene({ phase, solvedCount, active, puzzleSpots, revealImage }: { phase: number; solvedCount: number; active: boolean; puzzleSpots: Hotspot[]; revealImage: string }) {
  const P = SKY_PORTAL;
  return (
    <>
      {TWINKLES.map((t, i) => <span key={i} className="sky-twinkle" style={{ left: `${t.x}%`, top: `${t.y}%`, animationDelay: `${t.delay}s` }} />)}
      <div className="sky-conduit" style={{ opacity: 0.25 + solvedCount * 0.25, filter: active || phase >= 1 ? "brightness(1.8)" : undefined }} />
      <div className="sky-holo-shimmer" style={{ left: "4%", top: "6%", width: "14%", height: "36%" }} />

      {/* Phase 1: systems synchronise */}
      {phase === 1 && puzzleSpots.map((h) => <span key={h.id} className="sky-scan" style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }} />)}
      {phase >= 1 && phase < 5 && <span className="sky-floor-sweep" />}

      {/* Phase 2: energy converges on the platform */}
      {phase === 2 && puzzleSpots.map((h) =>
        trail({ x: h.x + h.w / 2, y: h.y + h.h / 2 }, SKY_PLATFORM, 14, { x: 0, y: 6 }).map((pt, i) => (
          <span key={`${h.id}-${i}`} className="sky-packet" style={{ left: `${pt.x}%`, top: `${pt.y}%`, animationDelay: `${pt.t * 0.8}s` }} />
        )),
      )}
      {phase >= 2 && <span className="sky-platform-glow" style={{ left: `${SKY_PLATFORM.x}%`, top: `${SKY_PLATFORM.y}%` }} />}

      {/* Phase 3+: rings assemble, portal opens onto the next realm */}
      {phase >= 3 && (
        <div className="absolute" style={{ left: `${P.cx}%`, top: `${P.cy}%`, width: `${P.w}%`, height: `${P.h}%`, transform: "translate(-50%,-50%)" }}>
          <div className={`sky-portal-view ${phase >= 4 ? "is-open" : ""}`}>
            <img src={revealImage} alt={phase >= 4 ? "Through the portal: the Enchanted Forest" : ""} className="h-full w-full object-cover" />
          </div>
          {phase === 3 && <span className="sky-core" />}
          <svg className="sky-rings" viewBox="0 0 100 100" aria-hidden>
            <circle className="sky-ring r1" cx="50" cy="50" r="48" />
            <circle className="sky-ring r2" cx="50" cy="50" r="42" />
            <circle className="sky-ring r3" cx="50" cy="50" r="36" />
          </svg>
          {phase === 4 && <span className="sky-flash" />}
        </div>
      )}
    </>
  );
}
