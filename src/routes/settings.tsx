import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScreenShell } from "@/components/game/ScreenShell";
import { actions, useGame } from "@/game/store";
import { DIFFICULTIES, type TimerOption } from "@/game/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Escape the Math Room" },
      { name: "description", content: "Choose difficulty, timer, hints, calculator, sound and motion settings." },
      { property: "og:title", content: "Settings — Escape the Math Room" },
      { property: "og:description", content: "Six difficulty tiers and an independent puzzle timer." },
    ],
  }),
  component: SettingsPage,
});

const TIMERS: { v: TimerOption; label: string }[] = [
  { v: "off", label: "No timer" },
  { v: 30, label: "30 s" },
  { v: 60, label: "60 s" },
  { v: 120, label: "120 s" },
  { v: "custom", label: "Custom" },
];

function Toggle({ label, desc, on, set }: { label: string; desc: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} className={`relative h-7 w-12 shrink-0 rounded-full border border-border transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-foreground transition-all ${on ? "left-[1.4rem]" : "left-0.5"}`} style={{ width: "1.35rem", height: "1.35rem" }} />
      </button>
    </div>
  );
}

function SettingsPage() {
  const { settings: s, hydrated } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!hydrated) return <ScreenShell title="Settings"><div /></ScreenShell>;

  return (
    <ScreenShell title="Settings">
      <p className="mb-6 text-sm text-muted-foreground">Changes save instantly and apply to the next puzzle you open.</p>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel p-6" aria-labelledby="diff">
          <h2 id="diff" className="text-xl font-bold text-primary">Difficulty</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">Changes the mathematics itself — every tier has its own questions.</p>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Difficulty">
            {DIFFICULTIES.map((d, i) => (
              <button key={d.id} type="button" role="radio" aria-checked={s.difficulty === d.id} aria-pressed={s.difficulty === d.id} className="opt" onClick={() => actions.updateSettings({ difficulty: d.id })}>
                <span className="flex items-center justify-between">
                  <span className="font-display font-bold">{i + 1}. {d.label}</span>
                  <span className="text-[0.65rem] uppercase tracking-widest text-accent">{d.band}</span>
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{d.blurb}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-5">
          <section className="panel p-6" aria-labelledby="timer">
            <h2 id="timer" className="text-xl font-bold text-primary">Puzzle timer</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">Independent of difficulty. Counts down only while a puzzle is open.</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Timer">
              {TIMERS.map((t) => (
                <button key={String(t.v)} type="button" role="radio" aria-checked={s.timer === t.v} aria-pressed={s.timer === t.v} className="chip !font-sans !text-sm" onClick={() => actions.updateSettings({ timer: t.v })}>{t.label}</button>
              ))}
            </div>
            {s.timer === "custom" && (
              <label className="mt-4 flex items-center gap-3 text-sm">
                Seconds (10–600)
                <input
                  type="number"
                  min={10}
                  max={600}
                  className="field w-28"
                  value={s.customSeconds}
                  onChange={(e) => actions.updateSettings({ customSeconds: Number(e.target.value) })}
                  onBlur={(e) => actions.updateSettings({ customSeconds: Math.min(600, Math.max(10, Math.round(Number(e.target.value) || 90))) })}
                />
              </label>
            )}
          </section>

          <section className="panel divide-y divide-border p-6" aria-label="Other settings">
            <Toggle label="Limited hints" desc="Only 1 hint per puzzle (solutions stay available)." on={s.hints === "limited"} set={(v) => actions.updateSettings({ hints: v ? "limited" : "unlimited" })} />
            <Toggle label="Calculator" desc="Show a scratch calculator inside puzzles." on={s.calculator} set={(v) => actions.updateSettings({ calculator: v })} />
            <Toggle label="Mute all audio" desc="Silences music and sound effects." on={s.muted} set={(v) => actions.updateSettings({ muted: v })} />
            <Toggle label="Sound effects" desc="Realm-themed chimes for answers, hints and mechanisms." on={s.sound} set={(v) => actions.updateSettings({ sound: v })} />
            {([["musicVolume", "Music volume"], ["sfxVolume", "Effects volume"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between gap-4 py-3">
                <span className="font-medium">{label}</span>
                <span className="flex items-center gap-3">
                  <input type="range" min={0} max={1} step={0.05} value={s[k]} disabled={s.muted} onChange={(e) => actions.updateSettings({ [k]: Number(e.target.value) })} className="w-32 accent-primary" aria-label={label} />
                  <span className="math w-10 text-right text-sm text-muted-foreground">{Math.round(s[k] * 100)}%</span>
                </span>
              </label>
            ))}
            <Toggle label="Reduced motion" desc="Turn off ambient animation and transitions." on={s.reducedMotion} set={(v) => actions.updateSettings({ reducedMotion: v })} />
          </section>

          <section className="panel p-6">
            <h2 className="text-lg font-bold text-primary">Progress</h2>
            {!confirmReset ? (
              <button className="btn btn-ghost mt-3 !px-0" onClick={() => setConfirmReset(true)}>Reset all progress…</button>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Lock all levels again?</span>
                <button className="btn btn-stone" onClick={() => setConfirmReset(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => { actions.resetAll(); setConfirmReset(false); }}>Reset</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </ScreenShell>
  );
}
