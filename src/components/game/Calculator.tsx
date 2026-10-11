import { useState } from "react";
import { evaluate } from "@/game/math";

export function Calculator() {
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState<string>("");
  const run = () => {
    const v = evaluate(expr);
    setOut(v === null ? "Can't evaluate that" : String(Math.round(v * 1e10) / 1e10));
  };
  return (
    <div className="rounded-lg border border-border bg-muted/60 p-3">
      <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground" htmlFor="calc">
        Scratch calculator
      </label>
      <div className="flex gap-2">
        <input
          id="calc"
          className="field min-w-0 flex-1 !text-base"
          placeholder="e.g. 2^6 or (22+18-7)"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              run();
            }
          }}
        />
        <button type="button" className="btn btn-stone btn-icon px-4" onClick={run}>=</button>
      </div>
      {out && <p className="math mt-2 text-accent" aria-live="polite">{out}</p>}
    </div>
  );
}
