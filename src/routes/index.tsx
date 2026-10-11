import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Map, Play, Settings } from "lucide-react";
import menuBg from "@/assets/menu-bg.jpg";
import { useGame } from "@/game/store";
import { LEVELS } from "@/game/levels";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Escape the Math Room — A Mathematical Adventure" },
      { name: "description", content: "Explore illustrated rooms, solve set, relation and calculus puzzles, and unlock your way out." },
      { property: "og:title", content: "Escape the Math Room" },
      { property: "og:description", content: "Solve the puzzles. Unlock the worlds. Find your way out." },
    ],
  }),
  component: MainMenu,
});

function MainMenu() {
  const game = useGame();
  const done = LEVELS.filter((l) => game.progress[l.id]?.completed).length;
  const started = Object.values(game.progress).some((p) => p.solved.length > 0 || p.completed);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img src={menuBg} alt="" aria-hidden width={1920} height={1088} className="anim-zoom absolute inset-0 h-full w-full object-cover" />
      <div className="scrim-left absolute inset-0" />
      <div className="vignette absolute inset-0" />
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="dust" style={{ left: `${(i * 41) % 100}%`, top: `${50 + ((i * 17) % 45)}%`, animationDuration: `${8 + (i % 4) * 2}s`, animationDelay: `${i * 0.7}s` }} />
      ))}

      <div className="relative flex min-h-screen flex-col justify-center px-6 py-12 sm:px-14 lg:px-24">
        <p className="anim-rise text-xs uppercase tracking-[0.45em] text-accent">A mathematical adventure</p>
        <h1 className="anim-rise title-glow mt-4 max-w-2xl text-5xl font-black leading-[0.95] sm:text-7xl" style={{ animationDelay: "0.1s" }}>
          <span className="text-gradient-amber">Escape</span>
          <br />
          <span className="text-foreground">the Math Room</span>
        </h1>
        <p className="anim-rise mt-5 max-w-md text-lg text-muted-foreground" style={{ animationDelay: "0.2s" }}>
          Solve the puzzles. Unlock the worlds. Find your way out.
        </p>

        <nav className="anim-rise mt-10 flex max-w-xs flex-col gap-3" style={{ animationDelay: "0.3s" }} aria-label="Main menu">
          <Link to="/play/$levelId" params={{ levelId: "dungeon" }} className="btn btn-primary py-4 text-base">
            <Play className="h-5 w-5" /> {started ? "Continue" : "Play"}
          </Link>
          <Link to="/levels" className="btn btn-stone"><Map className="h-4 w-4" /> Level selection</Link>
          <Link to="/settings" className="btn btn-stone"><Settings className="h-4 w-4" /> Settings</Link>
          <Link to="/how-to-play" className="btn btn-stone"><BookOpen className="h-4 w-4" /> How to play</Link>
        </nav>

        {game.hydrated && (
          <p className="mt-6 text-sm text-muted-foreground">
            Progress: <span className="math text-accent">{done}/5</span> rooms escaped
          </p>
        )}

        <footer className="absolute bottom-5 left-6 right-6 text-xs text-muted-foreground/80 sm:left-14 lg:left-24">
          A college project for <em>Mathematical Foundations of Computer Applications</em> · Sets · Relations · Functions · Limits · Continuity · Differentiation
        </footer>
      </div>
    </main>
  );
}
