import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Clock, Lightbulb, ScrollText, X, RotateCcw, Calculator as CalcIcon } from "lucide-react";
import type { PuzzleDef, PuzzleVariant } from "@/game/types";
import { LIMITED_HINTS, timerSeconds, type Settings } from "@/game/settings";
import { numbersEqual, parseNumber } from "@/game/math";
import { play } from "@/game/sound";
import { Calculator } from "./Calculator";

interface Props {
  puzzle: PuzzleDef;
  variant: PuzzleVariant;
  index: number;
  solved: boolean;
  settings: Settings;
  paused: boolean;
  onClose: () => void;
  onSolved: (assisted: boolean) => void;
}

type Feedback = { tone: "error" | "success" | "info"; text: string } | null;

export function PuzzleOverlay({ puzzle, variant, index, solved, settings, paused, onClose, onSolved }: Props) {
  const total = timerSeconds(settings);
  const [timerOn, setTimerOn] = useState(total !== null && !solved);
  const [remaining, setRemaining] = useState(total ?? 0);
  const [expired, setExpired] = useState(false);
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [choice, setChoice] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(solved ? { tone: "success", text: "Already solved — the mechanism is active." } : null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [done, setDone] = useState(solved);
  const firstField = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const hintCap = settings.hints === "limited" ? LIMITED_HINTS : 3;
  const running = timerOn && !paused && !done && !expired;

  // Single interval, only while the overlay is open and active.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setExpired(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (expired) play("error", settings.sound);
  }, [expired, settings.sound]);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const a = variant.answer;

  const check = () => {
    if (done || expired) return;
    let ok = false;
    let msg = "";
    if (a.kind === "numeric") {
      const v = parseNumber(input);
      if (v === null) {
        setFeedback({ tone: "info", text: "Enter a number (decimals and fractions like 3/4 are fine)." });
        return;
      }
      ok = numbersEqual(v, a.value);
      msg = variant.wrongNudge ?? "Not quite. Check each step and try again.";
    } else if (a.kind === "set") {
      if (picked.length === 0) {
        setFeedback({ tone: "info", text: "Select at least one rune first." });
        return;
      }
      const missing = a.correct.filter((c) => !picked.includes(c)).length;
      const extra = picked.filter((p) => !a.correct.includes(p)).length;
      ok = missing === 0 && extra === 0;
      msg = [extra ? `${extra} selected element${extra > 1 ? "s don't" : " doesn't"} belong` : "", missing ? `${missing} element${missing > 1 ? "s are" : " is"} still missing` : ""]
        .filter(Boolean)
        .join(", and ") + ".";
    } else {
      if (choice.length === 0) {
        setFeedback({ tone: "info", text: "Choose an option first." });
        return;
      }
      ok = choice.length === a.correct.length && a.correct.every((c) => choice.includes(c));
      msg = "That combination isn't right. Test each property against its definition.";
    }
    if (ok) {
      setDone(true);
      setFeedback({ tone: "success", text: "Correct! The mechanism shudders to life." });
      play("success", settings.sound);
      onSolved(hintsShown > 0 || showSolution);
    } else {
      setFeedback({ tone: "error", text: msg.charAt(0).toUpperCase() + msg.slice(1) });
      setShakeKey((k) => k + 1);
      play("error", settings.sound);
    }
  };

  const revealHint = () => {
    if (hintsShown >= hintCap) return;
    setHintsShown((h) => h + 1);
    setHelpOpen(true);
    play("hint", settings.sound);
  };

  const mm = String(Math.floor(remaining / 60));
  const ss = String(remaining % 60).padStart(2, "0");
  const low = remaining <= 10;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="puzzle-title">
      <div className="scrim absolute inset-0" onClick={onClose} aria-hidden />
      <div ref={dialogRef} className="panel anim-rise relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Puzzle {index + 1} of 3 · {puzzle.topic}</p>
            <h2 id="puzzle-title" className="mt-1 text-xl font-bold text-primary sm:text-2xl">{puzzle.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {timerOn && !done && (
              <span className={`math flex items-center gap-1.5 rounded-full border px-3 py-1 text-base ${low ? "border-destructive text-destructive" : "border-border text-foreground"}`} aria-live="off" aria-label={`Time remaining ${mm} minutes ${ss} seconds`}>
                <Clock className="h-4 w-4" /> {mm}:{ss}
                {paused && <span className="ml-1 text-xs uppercase tracking-widest text-muted-foreground">paused</span>}
              </span>
            )}
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close puzzle and return to room">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7">
          <p className="text-muted-foreground">{variant.prompt}</p>
          <div className="my-4 rounded-lg border border-border bg-background/60 px-5 py-4">
            {variant.math.map((m) => (
              <p key={m} className="math leading-relaxed text-foreground">{m}</p>
            ))}
          </div>
          <p className="mb-4 font-medium text-foreground">{variant.ask}</p>

          {/* Answer mechanism */}
          <form
            key={shakeKey}
            className={shakeKey ? "anim-shake" : ""}
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
          >
            <fieldset disabled={done || expired}>
              {a.kind === "numeric" && (
                <input
                  ref={firstField}
                  className="field w-full sm:w-64"
                  inputMode="decimal"
                  aria-label="Your answer"
                  placeholder={a.placeholder ?? "Your answer"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              )}
              {a.kind === "set" && (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Select elements">
                  {a.options.map((o) => (
                    <button
                      type="button"
                      key={o}
                      className="chip"
                      aria-pressed={picked.includes(o) || (done && a.correct.includes(o))}
                      onClick={() => {
                        play("click", settings.sound);
                        setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
              {a.kind === "choice" && (
                <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Select options">
                  {a.options.map((o, i) => (
                    <button
                      type="button"
                      key={o}
                      className="opt"
                      aria-pressed={choice.includes(i) || (done && a.correct.includes(i))}
                      onClick={() => {
                        play("click", settings.sound);
                        setChoice((c) => (a.multi ? (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]) : [i]));
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
              {!done && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="submit" className="btn btn-primary">Check answer</button>
                  {settings.calculator && (
                    <button type="button" className="btn btn-ghost" onClick={() => setCalcOpen((v) => !v)} aria-expanded={calcOpen}>
                      <CalcIcon className="h-4 w-4" /> Calculator
                    </button>
                  )}
                  <span className="text-xs text-muted-foreground">Press Enter to submit</span>
                </div>
              )}
            </fieldset>
          </form>

          {calcOpen && settings.calculator && !done && <div className="mt-3"><Calculator /></div>}

          {feedback && (
            <p
              role="status"
              className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                feedback.tone === "success" ? "border-success/50 text-success" : feedback.tone === "error" ? "border-destructive/50 text-destructive" : "border-border text-muted-foreground"
              }`}
            >
              {feedback.tone === "success" && <CheckCircle2 className="h-5 w-5 shrink-0" />}
              {feedback.text}
            </p>
          )}

          {expired && !done && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="font-display font-bold text-destructive">Time's up!</p>
              <p className="mt-1 text-sm text-muted-foreground">The runes dim. You can try again with a fresh timer, or keep going without one.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn btn-stone" onClick={() => { setRemaining(total ?? 0); setExpired(false); }}>
                  <RotateCcw className="h-4 w-4" /> Retry timer
                </button>
                <button className="btn btn-rune" onClick={() => { setTimerOn(false); setExpired(false); }}>
                  Continue without timer
                </button>
              </div>
            </div>
          )}

          {/* Help */}
          <div className="mt-6 rounded-lg border border-border">
            <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setHelpOpen((v) => !v)} aria-expanded={helpOpen}>
              <span className="font-display text-sm font-bold uppercase tracking-widest text-accent">Help · hints {hintsShown}/{hintCap}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${helpOpen ? "rotate-180" : ""}`} />
            </button>
            {helpOpen && (
              <div className="space-y-3 border-t border-border px-4 py-4">
                {variant.hints.slice(0, hintsShown).map((h, i) => (
                  <p key={i} className="anim-rise text-sm"><span className="font-bold text-primary">Hint {i + 1}. </span>{h}</p>
                ))}
                <p className="text-xs text-muted-foreground">Using a hint or the solution marks this puzzle as “assisted” in your results — you still escape.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-rune" onClick={revealHint} disabled={hintsShown >= hintCap}>
                    <Lightbulb className="h-4 w-4" /> {hintsShown >= hintCap ? (settings.hints === "limited" ? "Hint limit reached" : "All hints shown") : `Reveal hint ${hintsShown + 1}`}
                  </button>
                  <button type="button" className="btn btn-stone" onClick={() => setShowSolution((v) => !v)} aria-expanded={showSolution}>
                    <ScrollText className="h-4 w-4" /> {showSolution ? "Hide solution" : "Show solution"}
                  </button>
                </div>
                {showSolution && (
                  <div className="anim-rise rounded-lg bg-background/60 p-4">
                    <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Worked solution</p>
                    <ol className="list-decimal space-y-1 pl-5">
                      {variant.solution.steps.map((s) => (
                        <li key={s} className="math">{s}</li>
                      ))}
                    </ol>
                    <p className="mt-3 text-sm text-muted-foreground"><span className="font-bold text-primary">Why: </span>{variant.solution.explanation}</p>
                    {!done && <p className="mt-2 text-xs text-accent">Enter the answer above to activate the mechanism.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {done && (
          <div className="border-t border-border px-5 py-4 sm:px-7">
            <button className="btn btn-primary w-full" onClick={onClose} autoFocus>Return to the room</button>
          </div>
        )}
      </div>
    </div>
  );
}
