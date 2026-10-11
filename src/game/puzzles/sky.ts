import type { Hotspot, PuzzleDef } from "../types";

const nums = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

/** Puzzle 1 — Functions: the hexagonal energy lock maps inputs to outputs. */
const LOCK_PUZZLE: PuzzleDef = {
  id: "lock",
  title: "The Hexagonal Mapping Lock",
  topic: "Functions",
  variants: {
    amateur: {
      prompt: "The lock reads an output code and needs the input that produced it.",
      math: ["f : ℝ → ℝ", "f(x) = 2x + 5", "Output shown: 17"],
      ask: "Enter f⁻¹(17), the input that makes the lock show 17.",
      answer: { kind: "numeric", value: 6 },
      hints: ["f⁻¹(17) is the x for which f(x) = 17.", "Solve 2x + 5 = 17.", "2x = 12."],
      solution: { steps: ["Set f(x) = 17: 2x + 5 = 17", "2x = 12", "x = 6, so f⁻¹(17) = 6"], explanation: "The inverse undoes f: subtract 5, then halve. Check: f(6) = 12 + 5 = 17." },
      wrongNudge: "Plug your answer back into 2x + 5 — does it give 17?",
    },
    apprentice: {
      prompt: "Only a one-to-one function can be reversed safely. Pick the function that will not jam the lock.",
      math: ["Each function maps ℝ → ℝ"],
      ask: "Which function is one-to-one (injective)?",
      answer: { kind: "choice", options: ["f(x) = x²", "f(x) = |x|", "f(x) = 2x + 1", "f(x) = cos x"], correct: [2], multi: false },
      hints: [
        "Injective means different inputs always give different outputs.",
        "Look for two different inputs with the same output, e.g. x and −x.",
        "x², |x| and cos x all give the same output for x and −x. A non-horizontal straight line never repeats a value.",
      ],
      solution: { steps: ["x²: f(2) = f(−2) = 4 → not injective", "|x|: f(3) = f(−3) = 3 → not injective", "cos x: cos 0 = cos 2π = 1 → not injective", "2x + 1: 2a + 1 = 2b + 1 ⇒ a = b → injective"], explanation: "A function is injective when f(a) = f(b) forces a = b. Only the linear function with non-zero slope passes." },
    },
    challenger: {
      prompt: "The lock's six faces are numbered 0 to 4 and light up for each value the function can produce.",
      math: ["A = {0, 1, 2, 3, 4}", "f : A → A", "f(x) = x² mod 5"],
      ask: "Select every element of the range of f.",
      answer: { kind: "set", options: nums(0, 4), correct: ["0", "1", "4"] },
      hints: ["The range is the set of actual outputs f(x) for x in A.", "Compute x² for each x, then take the remainder when dividing by 5.", "0, 1, 4, 9, 16 → remainders 0, 1, 4, 4, 1."],
      solution: { steps: ["f(0) = 0, f(1) = 1, f(2) = 4", "f(3) = 9 mod 5 = 4, f(4) = 16 mod 5 = 1", "Range f = {0, 1, 4}"], explanation: "2 and 3 are never outputs, so f is not onto A. It is also not one-to-one, since f(1) = f(4)." },
    },
    expert: {
      prompt: "Three energy cores must be routed into five distinct sockets — no two cores may share a socket.",
      math: ["|A| = 3,  |B| = 5", "f : A → B injective"],
      ask: "How many one-to-one functions f : A → B are there?",
      answer: { kind: "numeric", value: 60 },
      hints: ["The first element of A can go to any of the 5 elements of B.", "Each next element has one fewer choice, because outputs may not repeat.", "Multiply 5 · 4 · 3."],
      solution: { steps: ["Choices for a₁: 5", "Choices for a₂: 4 (a₁'s image is taken)", "Choices for a₃: 3", "Total = 5 · 4 · 3 = 60"], explanation: "The number of injections from an m-set into an n-set is n!/(n − m)! = 5!/2! = 60." },
      wrongNudge: "Outputs can't repeat — each new element has fewer sockets available.",
    },
    mastermind: {
      prompt: "Four signal beams must be sent to three receivers so that every receiver gets at least one beam.",
      math: ["|A| = 4,  |B| = 3", "f : A → B onto (surjective)"],
      ask: "How many onto functions f : A → B are there?",
      answer: { kind: "numeric", value: 36 },
      hints: ["Count all functions, then subtract those that miss at least one receiver.", "Use inclusion–exclusion: 3⁴ − C(3,1)·2⁴ + C(3,2)·1⁴.", "81 − 48 + 3."],
      solution: { steps: ["All functions: 3⁴ = 81", "Missing a chosen receiver: C(3,1) · 2⁴ = 48", "Missing two receivers (added back): C(3,2) · 1⁴ = 3", "Onto functions = 81 − 48 + 3 = 36"], explanation: "Inclusion–exclusion removes functions whose range misses some element of B. Equivalently 3! · S(4,3) = 6 · 6 = 36." },
      wrongNudge: "Did you add back the functions that miss two receivers? They were subtracted twice.",
    },
    legendary: {
      prompt: "The lock accepts only self-reversing codes: applying the mapping twice must return every face to where it started.",
      math: ["A = {1, 2, 3, 4}", "f : A → A with f(f(x)) = x for all x ∈ A"],
      ask: "How many such functions (involutions) are there?",
      answer: { kind: "numeric", value: 10 },
      hints: [
        "f(f(x)) = x makes f a bijection that is its own inverse: each element is fixed or swapped with exactly one partner.",
        "Count by number of swapped pairs: 0 pairs, 1 pair, or 2 pairs.",
        "0 pairs: 1 way. 1 pair: C(4,2) = 6. 2 pairs: 3 ways.",
      ],
      solution: { steps: ["No swaps (identity): 1", "Exactly one swap: C(4,2) = 6", "Two disjoint swaps: {12|34}, {13|24}, {14|23} = 3", "Total = 1 + 6 + 3 = 10"], explanation: "An involution decomposes into fixed points and 2-cycles. Summing over the number of 2-cycles gives 10." },
      wrongNudge: "Each element must be fixed or paired with one other — count by the number of pairs.",
    },
  },
};

/** Puzzle 2 — Relations: the circuit panel routes energy along directed connections. */
const CIRCUIT_PUZZLE: PuzzleDef = {
  id: "circuit",
  title: "The Circuit-Routing Matrix",
  topic: "Relations",
  variants: {
    amateur: {
      prompt: "Each glowing wire on the panel is an ordered pair (from, to). Route power out of node 2.",
      math: ["R = {(1,2), (1,3), (2,3), (2,4), (3,4)}"],
      ask: "Select every node b with (2, b) ∈ R.",
      answer: { kind: "set", options: nums(1, 4), correct: ["3", "4"] },
      hints: ["Look only at pairs whose first entry is 2.", "There are two such pairs.", "(2,3) and (2,4)."],
      solution: { steps: ["Pairs starting at 2: (2,3), (2,4)", "So b ∈ {3, 4}"], explanation: "In an ordered pair (a, b) the relation goes from a to b. (1,2) points into 2, not out of it." },
    },
    apprentice: {
      prompt: "Nodes in the same group share one power line. The panel groups nodes by an equivalence relation.",
      math: ["A = {1, 2, 3}", "R = {(1,1), (2,2), (3,3), (1,2), (2,1)}"],
      ask: "How many equivalence classes does R have?",
      answer: { kind: "numeric", value: 2 },
      hints: ["An equivalence class [a] is every element related to a.", "[1] = {1, 2}. What is [3]?", "3 is only related to itself."],
      solution: { steps: ["R is reflexive, symmetric and transitive", "[1] = [2] = {1, 2}", "[3] = {3}", "Classes: {1, 2} and {3} → 2"], explanation: "Equivalence classes partition A. Here A = {1, 2} ∪ {3}." },
      wrongNudge: "1 and 2 are related to each other — they belong to the same class.",
    },
    challenger: {
      prompt: "Power flows first along R, then along S. Configure the combined route S ∘ R.",
      math: ["R = {(1,2), (2,3), (3,4)}", "S = {(2,1), (3,3), (4,2)}", "S ∘ R = {(a, c) : ∃b, (a,b) ∈ R and (b,c) ∈ S}"],
      ask: "Select every pair in S ∘ R.",
      answer: { kind: "set", options: ["(1,1)", "(1,3)", "(2,1)", "(2,3)", "(3,2)", "(4,2)"], correct: ["(1,1)", "(2,3)", "(3,2)"] },
      hints: ["Take each pair (a, b) of R, then look for pairs in S that start at b.", "(1,2) ∈ R and (2,1) ∈ S give (1,1).", "Also chain (2,3) with (3,3), and (3,4) with (4,2)."],
      solution: { steps: ["(1,2) then (2,1) → (1,1)", "(2,3) then (3,3) → (2,3)", "(3,4) then (4,2) → (3,2)", "S ∘ R = {(1,1), (2,3), (3,2)}"], explanation: "Composition means 'apply R first, then S'. Every pair needs a middle element b linking them." },
    },
    expert: {
      prompt: "The tower's priority network is the divisibility order. Only direct links (no shortcut through a middle node) are wired.",
      math: ["A = {1, 2, 3, 4, 6, 12}", "a ≼ b ⇔ a divides b"],
      ask: "How many edges does the Hasse diagram of (A, ≼) have?",
      answer: { kind: "numeric", value: 7 },
      hints: ["A Hasse edge a → b means a | b, a ≠ b, and no c strictly between them.", "From 1 the only direct links are to 2 and 3 (primes).", "Edges: 1–2, 1–3, 2–4, 2–6, 3–6, 4–12, 6–12."],
      solution: { steps: ["Covering pairs from 1: (1,2), (1,3)", "From 2: (2,4), (2,6);  from 3: (3,6)", "From 4: (4,12);  from 6: (6,12)", "Total = 7 edges"], explanation: "Hasse diagrams omit reflexive loops and edges implied by transitivity, e.g. 1 → 4 is implied by 1 → 2 → 4." },
      wrongNudge: "Leave out edges implied by transitivity, such as 1 → 4 or 2 → 12.",
    },
    mastermind: {
      prompt: "The panel accepts any one-way wiring scheme: no two different nodes may be linked in both directions.",
      math: ["A = {a, b, c}", "R ⊆ A × A antisymmetric"],
      ask: "How many antisymmetric relations on A are there?",
      answer: { kind: "numeric", value: 216 },
      hints: ["Treat the 3 loops (x, x) separately from the 3 unordered pairs {x, y}.", "Each loop is in or out: 2 choices. Each pair {x, y} has 3 allowed options.", "The options for a pair: neither, only (x,y), or only (y,x)."],
      solution: { steps: ["Diagonal pairs: 3, each in or out → 2³ = 8", "Off-diagonal unordered pairs: C(3,2) = 3, each with 3 options → 3³ = 27", "Total = 8 · 27 = 216"], explanation: "Antisymmetry forbids having both (x,y) and (y,x) for x ≠ y, removing one of the four options per pair." },
      wrongNudge: "Loops (x, x) are always allowed in an antisymmetric relation.",
    },
    legendary: {
      prompt: "The master router needs a valid partial order on its three control nodes.",
      math: ["A = {x, y, z}", "≼ reflexive, antisymmetric, transitive"],
      ask: "How many distinct partial orders on A are there?",
      answer: { kind: "numeric", value: 19 },
      hints: [
        "Classify by the shape of the Hasse diagram, then count labellings.",
        "Shapes: antichain, one edge + isolated point, chain, 'V' (one below two), 'Λ' (two below one).",
        "Counts: 1, 6, 6, 3, 3.",
      ],
      solution: { steps: ["Antichain (no comparisons): 1", "One comparison a ≺ b, third isolated: 3 · 2 = 6", "Total chain a ≺ b ≺ c: 3! = 6", "One minimum below two incomparable: 3", "Two incomparable below one maximum: 3", "Total = 1 + 6 + 6 + 3 + 3 = 19"], explanation: "Every partial order on 3 elements has one of five Hasse shapes; summing labelled versions gives 19." },
      wrongNudge: "Count each Hasse-diagram shape separately, then add.",
    },
  },
};

/** Puzzle 3 — Limits, continuity and derivatives on the holographic console. */
const CONSOLE_PUZZLE: PuzzleDef = {
  id: "console",
  title: "The Holographic Stabiliser",
  topic: "Limits & Derivatives",
  variants: {
    amateur: {
      prompt: "The console's signal curve approaches a stable value. Lock it in.",
      math: ["lim₍ₓ→₃₎ (2x + 1)"],
      ask: "Enter the value of the limit.",
      answer: { kind: "numeric", value: 7 },
      hints: ["2x + 1 is a polynomial, so it is continuous everywhere.", "For continuous functions the limit equals the function value.", "Substitute x = 3."],
      solution: { steps: ["2x + 1 is continuous at x = 3", "lim = 2(3) + 1 = 7"], explanation: "Polynomials are continuous, so their limits are found by direct substitution." },
    },
    apprentice: {
      prompt: "As the tower climbs toward infinity, the stabiliser settles on a level.",
      math: ["lim₍ₓ→∞₎ (3x² + 1) / (x² − 5)"],
      ask: "What is the limit?",
      answer: { kind: "choice", options: ["0", "1", "3", "∞"], correct: [2], multi: false },
      hints: ["Divide numerator and denominator by the highest power, x².", "1/x² → 0 and 5/x² → 0 as x → ∞.", "You are left with 3/1."],
      solution: { steps: ["(3x² + 1)/(x² − 5) = (3 + 1/x²)/(1 − 5/x²)", "As x → ∞: (3 + 0)/(1 − 0) = 3"], explanation: "When the degrees match, the limit at infinity is the ratio of the leading coefficients." },
    },
    challenger: {
      prompt: "A rotating hologram's amplitude collapses near zero — but not to zero.",
      math: ["lim₍ₓ→₀₎ sin(5x) / x"],
      ask: "Enter the value of the limit.",
      answer: { kind: "numeric", value: 5 },
      hints: ["Use the standard limit lim₍ᵤ→₀₎ sin u / u = 1.", "Write sin(5x)/x = 5 · sin(5x)/(5x).", "Let u = 5x; u → 0 as x → 0."],
      solution: { steps: ["sin(5x)/x = 5 · [sin(5x)/(5x)]", "With u = 5x → 0: sin u / u → 1", "Limit = 5 · 1 = 5"], explanation: "Rescaling the argument lets you use the fundamental trigonometric limit." },
      wrongNudge: "Multiply and divide by 5 so the argument of sine matches the denominator.",
    },
    expert: {
      prompt: "The power output follows a composite curve. The console needs its rate of change at x = 1.",
      math: ["f(x) = (x² + 1)³"],
      ask: "Enter f′(1).",
      answer: { kind: "numeric", value: 24 },
      hints: ["Use the chain rule: (g(x)ⁿ)′ = n · g(x)ⁿ⁻¹ · g′(x).", "f′(x) = 3(x² + 1)² · 2x.", "At x = 1: 3 · 2² · 2."],
      solution: { steps: ["f′(x) = 3(x² + 1)² · (2x) = 6x(x² + 1)²", "f′(1) = 6 · 1 · (1 + 1)² = 6 · 4 = 24"], explanation: "The chain rule multiplies the outer derivative by the derivative of the inner function." },
      wrongNudge: "Don't forget the inner derivative 2x from the chain rule.",
    },
    mastermind: {
      prompt: "Direct substitution gives 0/0 — an unstable reading. Resolve the indeterminate form.",
      math: ["lim₍ₓ→₄₎ (√x − 2) / (x − 4)"],
      ask: "Enter the exact value (a fraction is fine).",
      answer: { kind: "numeric", value: 0.25, placeholder: "e.g. 1/3" },
      hints: ["Factor x − 4 as a difference of squares in √x.", "x − 4 = (√x − 2)(√x + 2).", "Cancel (√x − 2), then substitute x = 4."],
      solution: { steps: ["x − 4 = (√x − 2)(√x + 2)", "(√x − 2)/(x − 4) = 1/(√x + 2) for x ≠ 4", "Limit = 1/(2 + 2) = 1/4"], explanation: "Cancelling the common factor removes the 0/0 form. (Equivalently, it is the derivative of √x at 4.)" },
      wrongNudge: "Rewrite x − 4 using √x so a factor cancels.",
    },
    legendary: {
      prompt: "The final stabiliser rejects first-order approximations. Find the cubic correction.",
      math: ["lim₍ₓ→₀₎ (tan x − x) / x³"],
      ask: "Enter the exact value (a fraction is fine).",
      answer: { kind: "numeric", value: 1 / 3, placeholder: "e.g. 1/2" },
      hints: ["It is a 0/0 form; L'Hôpital's rule or a Taylor series works.", "tan x = x + x³/3 + O(x⁵).", "Subtract x and divide by x³."],
      solution: { steps: ["tan x = x + x³/3 + 2x⁵/15 + …", "tan x − x = x³/3 + O(x⁵)", "(tan x − x)/x³ → 1/3"], explanation: "Via L'Hôpital: (sec²x − 1)/(3x²) = tan²x/(3x²) → 1/3, since tan x / x → 1." },
      wrongNudge: "Expand tan x to the x³ term.",
    },
  },
};

export const SKY_PUZZLES = [LOCK_PUZZLE, CIRCUIT_PUZZLE, CONSOLE_PUZZLE];

/** Inner opening of the transit ring (percent of room). */
export const SKY_PORTAL = { cx: 49.4, cy: 35.5, w: 26, h: 41.5 };
/** Platform centre where energy converges. */
export const SKY_PLATFORM = { x: 47.5, y: 61 };
/** Three violet ring-node indicators, one per puzzle. */
export const SKY_NODES = [
  { x: 31.6, y: 36.2, d: 2.6 },
  { x: 49.4, y: 11.2, d: 2.6 },
  { x: 61.3, y: 36.2, d: 2.6 },
];

export const SKY_HOTSPOTS: Hotspot[] = [
  { id: "lock", label: "Energy Lock", x: 5, y: 57, w: 11.5, h: 37, puzzleId: "lock" },
  { id: "circuit", label: "Circuit Panel", x: 72.8, y: 21, w: 9.8, h: 30, puzzleId: "circuit" },
  { id: "console", label: "Holo Console", x: 3, y: 5, w: 16.5, h: 46, puzzleId: "console", labelBelow: true },
  { id: "portal", label: "Transit Ring", x: 30, y: 9, w: 35, h: 55 },
  { id: "conduit", label: "Power Conduit", x: 82.4, y: 0, w: 3.4, h: 58, effect: "flare", lines: ["The conduit hums. Its light dims and brightens with each system you restore.", "Etched on the casing: “I = dQ/dt”. Someone here loved derivatives."] },
  { id: "elevator", label: "Glass Elevator", x: 86.5, y: 1, w: 13, h: 64, labelBelow: true, lines: ["The elevator's display reads: ACCESS DENIED — TRANSIT RING OFFLINE.", "Floor 1,024. Of course it's a power of two."] },
  { id: "window", label: "Observation Window", x: 20, y: 22, w: 9, h: 30, lines: ["The city glitters a kilometre below. Clouds drift between the towers.", "Traffic lanes trace perfect parabolas between the skyscrapers."] },
  { id: "moon", label: "Distant Moon", x: 61, y: 6, w: 6.5, h: 10, effect: "flare", labelBelow: true, lines: ["A pale moon hangs over the skyline. The ring frames it like a target."] },
  { id: "floor", label: "Floor Circuits", x: 66, y: 74, w: 20, h: 22, lines: ["Golden traces run beneath the polished floor, all leading to the platform."] },
];
