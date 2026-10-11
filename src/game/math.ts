/** Parse a user-typed number: integers, decimals, simple fractions like "1/2" or "-3/4". */
export function parseNumber(input: string): number | null {
  const s = input.trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/,/g, "");
  if (!s) return null;
  const frac = s.match(/^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/);
  if (frac) {
    const d = parseFloat(frac[2]!);
    return d === 0 ? null : parseFloat(frac[1]!) / d;
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  return parseFloat(s);
}

export function numbersEqual(a: number, b: number) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
}

/** Tiny safe calculator: digits, operators, parentheses, sqrt/sin/cos/tan/ln/log, pi, e. */
export function evaluate(expr: string): number | null {
  const cleaned = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi");
  if (!/^[0-9+\-*/^().\s,a-z]*$/i.test(cleaned)) return null;
  const words = cleaned.match(/[a-z]+/gi) ?? [];
  const allowed = ["sqrt", "sin", "cos", "tan", "ln", "log", "pi", "e", "abs"];
  if (words.some((w) => !allowed.includes(w.toLowerCase()))) return null;
  const js = cleaned
    .replace(/\^/g, "**")
    .replace(/\bsqrt\b/g, "Math.sqrt")
    .replace(/\bsin\b/g, "Math.sin")
    .replace(/\bcos\b/g, "Math.cos")
    .replace(/\btan\b/g, "Math.tan")
    .replace(/\bln\b/g, "Math.log")
    .replace(/\blog\b/g, "Math.log10")
    .replace(/\babs\b/g, "Math.abs")
    .replace(/\bpi\b/g, "Math.PI")
    .replace(/\be\b/g, "Math.E");
  try {
    const v = Function(`"use strict";return (${js});`)();
    return typeof v === "number" && isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
