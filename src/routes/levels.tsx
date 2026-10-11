import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Lock, Hammer } from "lucide-react";
import { ScreenShell } from "@/components/game/ScreenShell";
import { LEVELS } from "@/game/levels";
import { getLevelProgress, isUnlocked, useGame } from "@/game/store";

export const Route = createFileRoute("/levels")({
  head: () => ({
    meta: [
      { title: "Choose a Room — Escape the Math Room" },
      { name: "description", content: "Pick one of five illustrated environments to escape. Levels unlock in order." },
      { property: "og:title", content: "Choose a Room — Escape the Math Room" },
      { property: "og:description", content: "Five worlds, fifteen puzzles. Levels unlock as you escape." },
    ],
  }),
  component: LevelSelect,
});

function LevelSelect() {
  const game = useGame();
  const [notice, setNotice] = useState<string | null>(null);
  const escaped = LEVELS.filter((l) => game.progress[l.id]?.completed).length;
  const solved = LEVELS.reduce((n, l) => n + getLevelProgress(game, l.id).solved.length, 0);

  return (
    <ScreenShell title="Choose a room">
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span>Rooms escaped <span className="math text-accent">{escaped}/5</span></span>
        <span>Puzzles solved <span className="math text-accent">{solved}/15</span></span>
        <div className="h-2 w-48 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${(solved / 15) * 100}%` }} /></div>
      </div>
      {notice && <p role="status" className="panel anim-rise mb-6 px-5 py-3 text-sm">{notice}</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LEVELS.map((l, i) => {
          const unlocked = game.hydrated && isUnlocked(game, l.id);
          const p = getLevelProgress(game, l.id);
          const body = (
            <>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={l.image} alt="" loading="lazy" className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${unlocked ? "" : "grayscale-[70%] brightness-50"}`} />
                <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 font-display text-xs font-bold tracking-widest text-primary">LEVEL {l.number}</span>
                {!unlocked && <Lock className="absolute inset-0 m-auto h-10 w-10 text-foreground/80" />}
                {p.completed && <CheckCircle2 className="absolute right-3 top-3 h-7 w-7 text-success" />}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-foreground">{l.name}</h2>
                <p className="mt-1 text-xs uppercase tracking-widest text-accent">{l.tagline}</p>
                <p className="mt-2 text-sm text-muted-foreground">{l.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{unlocked ? (l.playable ? `${p.solved.length}/3 puzzles` : "In construction") : "Locked"}</span>
                  {unlocked && l.playable && <span className="font-display font-bold text-primary">{p.completed ? "Replay →" : "Enter →"}</span>}
                  {unlocked && !l.playable && <Hammer className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </>
          );
          return unlocked && l.playable ? (
            <Link key={l.id} to="/play/$levelId" params={{ levelId: l.id }} className="panel group overflow-hidden transition-transform hover:-translate-y-1">{body}</Link>
          ) : (
            <button
              key={l.id}
              type="button"
              className="panel group overflow-hidden text-left opacity-90"
              onClick={() => setNotice(unlocked ? `${l.name} is unlocked but still being built — check back in the next update.` : `${l.name} is locked. Escape ${LEVELS[i - 1]?.name} first.`)}
            >
              {body}
            </button>
          );
        })}
      </div>
    </ScreenShell>
  );
}
