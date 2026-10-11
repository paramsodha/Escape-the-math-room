import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FastForward, HelpCircle, Home, Pause, Play as PlayIcon, RotateCcw, Settings as Cog, Trophy, Volume2, VolumeX } from "lucide-react";
import { Room, type GatePhase } from "@/components/game/Room";
import { PuzzleOverlay } from "@/components/game/PuzzleOverlay";
import { ScreenShell } from "@/components/game/ScreenShell";
import { actions, getLevelProgress, isUnlocked, useGame } from "@/game/store";
import { getLevel, LEVELS } from "@/game/levels";
import { DIFFICULTIES, timerSeconds } from "@/game/settings";
import { GATE, SOCKETS } from "@/game/puzzles/dungeon";
import { SKY_NODES } from "@/game/puzzles/sky";
import { getRealm, REALMS } from "@/game/realm-defs";
import { SceneRoom } from "@/components/game/SceneRoom";
import { SkyCelebration, SkyScene } from "@/components/game/realms/SkyScene";
import { play } from "@/game/sound";
import { audio } from "@/game/audio";

export const Route = createFileRoute("/play/$levelId")({
  head: ({ params }) => {
    const name = getLevel(params.levelId)?.name ?? "Unknown Room";
    return {
      meta: [
        { title: `${name} — Escape the Math Room` },
        { name: "description", content: `Explore ${name}, solve three math puzzles and open the exit.` },
        { property: "og:title", content: `${name} — Escape the Math Room` },
        { property: "og:description", content: `Explore ${name}, solve three math puzzles and open the exit.` },
      ],
    };
  },
  component: PlayPage,
});

type Modal = null | "pause" | "help" | "confirm-menu" | "confirm-restart";

function PlayPage() {
  const { levelId } = Route.useParams();
  // Keyed so moving to the next realm starts with fresh room state.
  return <PlayLevel key={levelId} levelId={levelId} />;
}

function PlayLevel({ levelId }: { levelId: string }) {
  const game = useGame();
  const navigate = useNavigate();
  const level = getLevel(levelId);
  const progress = getLevelProgress(game, levelId);
  const [openPuzzle, setOpenPuzzle] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const realm = getRealm(levelId) ?? REALMS["dungeon"]!;
  const PUZZLES = realm.puzzles;
  const [narration, setNarration] = useState(realm.intro);
  const [phase, setPhase] = useState<GatePhase>(0);
  const [celebrate, setCelebrate] = useState<{ id: string; n: number } | null>(null);
  const pendingCelebrate = useRef<string | null>(null);
  const timers = useRef<number[]>([]);
  const playable = !!level?.playable && !!getRealm(levelId) && game.hydrated && isUnlocked(game, levelId);

  const solvedCount = PUZZLES.filter((p) => progress.solved.includes(p.id)).length;
  const difficulty = DIFFICULTIES.find((d) => d.id === game.settings.difficulty)!;
  const t = timerSeconds(game.settings);
  const nextLevel = level ? LEVELS[level.number] : undefined;

  // Realm music: one track per realm, faded in/out, never restarted on re-render.
  useEffect(() => {
    if (!playable) return;
    audio.playMusic(levelId);
    return () => audio.stopMusic();
  }, [playable, levelId]);
  useEffect(() => audio.duck(modal !== null || !!openPuzzle), [modal, openPuzzle]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const finishSequence = useCallback(() => {
    clearTimers();
    setPhase(5);
    actions.completeLevel(levelId);
    play("complete", game.settings.sound);
  }, [levelId, game.settings.sound]);

  const startGateSequence = () => {
    if (phase !== 0) return; // guards duplicate clicks
    setOpenPuzzle(null);
    setPhase(1);
    play("mechanism", game.settings.sound);
    setNarration(realm.readyLine);
    if (game.settings.reducedMotion) {
      setNarration(realm.skipLine);
      finishSequence();
      return;
    }
    for (const step of realm.timeline) {
      if (step.phase === 1) continue;
      timers.current.push(
        window.setTimeout(() => {
          if (step.phase === 5) return finishSequence();
          setPhase(step.phase as GatePhase);
          if (step.sfx) play(step.sfx, game.settings.sound);
          if (step.line) setNarration(step.line);
        }, step.at),
      );
    }
  };

  const closePuzzle = useCallback(() => {
    setOpenPuzzle(null);
    const id = pendingCelebrate.current;
    if (id) {
      pendingCelebrate.current = null;
      setCelebrate((c) => ({ id, n: (c?.n ?? 0) + 1 }));
      window.setTimeout(() => play("mechanism", game.settings.sound), 1300);
    }
  }, [game.settings.sound]);

  if (!game.hydrated) return <div className="min-h-screen bg-background" />;

  if (!level || !playable) {
    return (
      <ScreenShell title={level?.name ?? "Unknown room"}>
        <div className="panel max-w-lg p-6">
          <p className="text-muted-foreground">
            {!level ? "This room doesn't exist." : !isUnlocked(game, levelId) ? "This room is locked. Complete the previous level to unlock it." : "This environment is still being built — its room, puzzles, music and unique exit sequence arrive in the next update. The Forgotten Dungeon and the Sky Tower are fully playable today."}
          </p>
          <Link to="/levels" className="btn btn-primary mt-5">Choose a level</Link>
        </div>
      </ScreenShell>
    );
  }

  const puzzle = PUZZLES.find((p) => p.id === openPuzzle);
  const resetRoom = (msg: string) => {
    clearTimers();
    actions.restartLevel(levelId);
    setOpenPuzzle(null);
    setPhase(0);
    setCelebrate(null);
    pendingCelebrate.current = null;
    setNarration(msg);
  };

  const onPuzzle = (id: string) => {
    play("click", game.settings.sound);
    setOpenPuzzle(id);
  };

  const onGate = () => {
    if (solvedCount < 3) {
      setNarration(realm.sealed(solvedCount));
      play("click", game.settings.sound);
      return;
    }
    startGateSequence();
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* HUD */}
      <header className="z-30 flex h-[4.5rem] items-center gap-2 border-b border-border bg-card/90 px-3 sm:gap-3 sm:px-5">
        <button className="btn btn-ghost btn-icon" onClick={() => setModal("confirm-menu")} aria-label="Return to main menu">
          <Home className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-primary sm:text-base">Level {level.number} · {level.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {difficulty.label} · Timer {t ? `${t}s per puzzle` : "off"} · Hints {game.settings.hints}
          </p>
        </div>
        <div className="flex items-center gap-2" aria-label={`${solvedCount} of 3 puzzles solved`}>
          {PUZZLES.map((p) => (
            <span key={p.id} className="socket relative !static block h-3.5 w-3.5 border border-accent/60" data-lit={progress.solved.includes(p.id)} title={p.title} />
          ))}
          <span className="math ml-1 text-sm">{solvedCount}/3</span>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={() => actions.updateSettings({ muted: !game.settings.muted })} aria-label={game.settings.muted ? "Unmute audio" : "Mute audio"} aria-pressed={game.settings.muted}>
          {game.settings.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <button className="btn btn-ghost btn-icon" onClick={() => setModal("help")} aria-label="How to play">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="btn btn-stone btn-icon" onClick={() => setModal("pause")} aria-label="Pause game">
          <Pause className="h-5 w-5" />
        </button>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {levelId === "dungeon" ? (
          <Room
            image={level.image}
            revealImage={nextLevel?.image ?? level.image}
            hotspots={realm.hotspots}
            solved={progress.solved}
            sockets={SOCKETS}
            puzzleOrder={PUZZLES.map((p) => p.id)}
            gate={GATE}
            phase={phase}
            celebrate={celebrate}
            onPuzzle={onPuzzle}
            onGate={onGate}
            onInspect={setNarration}
          />
        ) : (
          <SceneRoom
            theme="sky"
            image={level.image}
            alt="The Sky Tower: a dormant transit ring on a platform before vast windows over a glowing night city, a holographic console, an energy lock, a circuit panel and a glass elevator"
            hotspots={realm.hotspots}
            solved={progress.solved}
            puzzleOrder={PUZZLES.map((p) => p.id)}
            nodes={SKY_NODES}
            exitId={realm.exitId}
            phase={phase}
            celebrate={celebrate}
            renderCelebration={SkyCelebration}
            renderScene={(sp) => <SkyScene {...sp} revealImage={nextLevel?.image ?? level.image} />}
            exitLabel={(ok) => (ok ? "ready" : "offline")}
            onPuzzle={onPuzzle}
            onExit={onGate}
            onInspect={setNarration}
          />
        )}
        <div className="pointer-events-none absolute bottom-3 left-1/2 w-[min(92%,44rem)] -translate-x-1/2">
          <p key={narration} className="panel anim-rise px-5 py-3 text-center text-sm sm:text-base" aria-live="polite">{narration}</p>
        </div>
        {phase >= 1 && phase < 5 && (
          <button className="btn btn-ghost absolute right-3 top-3 bg-background/60" onClick={finishSequence}>
            <FastForward className="h-4 w-4" /> Skip
          </button>
        )}
      </div>

      {puzzle && (
        <PuzzleOverlay
          key={puzzle.id}
          puzzle={puzzle}
          index={PUZZLES.indexOf(puzzle)}
          variant={puzzle.variants[game.settings.difficulty]}
          solved={progress.solved.includes(puzzle.id)}
          settings={game.settings}
          paused={modal !== null}
          onClose={closePuzzle}
          onSolved={(assisted) => {
            if (progress.solved.includes(puzzle.id)) return;
            const willBe = solvedCount + 1;
            actions.solvePuzzle(levelId, puzzle.id, assisted);
            pendingCelebrate.current = puzzle.id;
            setNarration(realm.solvedLine(willBe));
          }}
        />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="scrim absolute inset-0" onClick={() => setModal(null)} />
          <div className="panel anim-rise relative w-full max-w-md p-6">
            {modal === "pause" && (
              <>
                <h2 className="text-2xl font-bold text-primary">Paused</h2>
                <p className="mt-1 text-sm text-muted-foreground">Any running timer is frozen. Your solved puzzles are saved automatically.</p>
                <div className="mt-5 grid gap-2">
                  <button className="btn btn-primary" onClick={() => setModal(null)} autoFocus><PlayIcon className="h-4 w-4" /> Resume</button>
                  <button className="btn btn-stone" onClick={() => setModal("confirm-restart")}><RotateCcw className="h-4 w-4" /> Restart room</button>
                  <Link to="/settings" className="btn btn-stone"><Cog className="h-4 w-4" /> Settings</Link>
                  <button className="btn btn-ghost" onClick={() => setModal("confirm-menu")}>Main menu</button>
                </div>
              </>
            )}
            {modal === "help" && (
              <>
                <h2 className="text-2xl font-bold text-primary">How to escape</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>Hover or tab over the room to discover objects. Glowing cyan dots mark puzzles.</li>
                  <li>Solve each puzzle to light one rune socket on the gate.</li>
                  <li>Stuck? Open Help inside a puzzle for three progressive hints or a worked solution.</li>
                  <li>When all three sockets glow, click the gate to escape.</li>
                </ul>
                <button className="btn btn-primary mt-5 w-full" onClick={() => setModal(null)} autoFocus>Got it</button>
              </>
            )}
            {modal === "confirm-menu" && (
              <>
                <h2 className="text-2xl font-bold text-primary">Leave the room?</h2>
                <p className="mt-2 text-sm text-muted-foreground">Solved puzzles are saved. An open puzzle's answer and timer will be reset.</p>
                <div className="mt-5 flex gap-2">
                  <button className="btn btn-stone flex-1" onClick={() => setModal(null)} autoFocus>Stay</button>
                  <button className="btn btn-primary flex-1" onClick={() => navigate({ to: "/" })}>Leave</button>
                </div>
              </>
            )}
            {modal === "confirm-restart" && (
              <>
                <h2 className="text-2xl font-bold text-primary">Restart this room?</h2>
                <p className="mt-2 text-sm text-muted-foreground">All three puzzles here will be unsolved again. Levels you've already unlocked stay unlocked.</p>
                <div className="mt-5 flex gap-2">
                  <button className="btn btn-stone flex-1" onClick={() => setModal("pause")} autoFocus>Cancel</button>
                  <button className="btn btn-primary flex-1" onClick={() => { resetRoom(realm.intro); setModal(null); }}>
                    Restart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {phase === 5 && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 lg:inset-y-0 lg:left-auto lg:items-center lg:pr-8" role="dialog" aria-modal="true" aria-labelledby="done-title">
          <div className="panel anim-rise relative w-full max-w-sm p-6 text-center">
            <Trophy className="mx-auto h-12 w-12 text-primary" />
            <h2 id="done-title" className="title-glow mt-3 text-3xl font-black text-primary">{realm.doneTitle}</h2>
            <p className="mt-2 text-muted-foreground">You escaped {level.name}.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border p-3"><p className="math text-2xl text-accent">3/3</p><p className="text-muted-foreground">puzzles solved</p></div>
              <div className="rounded-lg border border-border p-3"><p className="math text-2xl text-accent">{3 - progress.assisted.length}</p><p className="text-muted-foreground">solved unassisted</p></div>
            </div>
            <div className="mt-6 grid gap-2">
              {nextLevel ? (
                <Link to="/play/$levelId" params={{ levelId: nextLevel.id }} className="btn btn-primary" autoFocus>Continue to {nextLevel.name.replace(/^The /, "the ")}</Link>
              ) : (
                <Link to="/levels" className="btn btn-primary" autoFocus>Level selection</Link>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Link to="/levels" className="btn btn-stone">All levels</Link>
                <button className="btn btn-ghost" onClick={() => resetRoom("Back at the beginning. Can you escape faster this time?")}>Replay room</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
