import { createFileRoute, Link } from "@tanstack/react-router";
import { ScreenShell } from "@/components/game/ScreenShell";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "How to Play — Escape the Math Room" },
      { name: "description", content: "Learn the controls, puzzles, hints, timer and difficulty tiers of Escape the Math Room." },
      { property: "og:title", content: "How to Play — Escape the Math Room" },
      { property: "og:description", content: "Explore, solve three puzzles per room, and open the exit." },
    ],
  }),
  component: HowTo,
});

const SECTIONS = [
  { t: "Objective", d: "Each room hides three mathematical puzzles. Solve all three to power the exit, then click it to escape and unlock the next room." },
  { t: "Explore", d: "Hover over the room (or press Tab) to reveal objects. Pulsing cyan dots mark puzzles; other objects react, hold clues or are just for fun." },
  { t: "Solve", d: "Type a number, select elements of a set, or pull the right levers. Press Enter or Check answer. Wrong answers explain what's off so you can try again." },
  { t: "Hints & solutions", d: "Open Help inside a puzzle. Hints appear one at a time, from a gentle nudge to strong guidance. Show solution reveals full working at any time — the puzzle is marked as assisted." },
  { t: "Timer", d: "Optional and independent of difficulty. It runs only while a puzzle is open and freezes when paused. If it runs out, retry or continue without a timer." },
  { t: "Difficulty", d: "Six tiers from Amateur to Legendary. Each tier uses different questions: foundational evaluation, intermediate limits and counting, advanced calculus and combinatorics." },
  { t: "Controls", d: "Mouse or touch to click; Tab and Enter for keyboard; Esc closes a puzzle. The pause button lets you resume, restart the room, or open settings." },
];

function HowTo() {
  return (
    <ScreenShell title="How to play">
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <section key={s.t} className="panel anim-rise p-6" style={{ animationDelay: `${i * 0.05}s` }}>
            <h2 className="text-lg font-bold text-primary">{s.t}</h2>
            <p className="mt-2 text-muted-foreground">{s.d}</p>
          </section>
        ))}
      </div>
      <Link to="/play/$levelId" params={{ levelId: "dungeon" }} className="btn btn-primary mt-8">Enter the dungeon</Link>
    </ScreenShell>
  );
}
