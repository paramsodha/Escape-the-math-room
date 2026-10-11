import type { Hotspot, PuzzleDef } from "../types";

const nums = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

export const SETS_PUZZLE: PuzzleDef = {
  id: "tablet",
  title: "The Tablet of Shared Runes",
  topic: "Sets",
  variants: {
    amateur: {
      prompt: "Two rune circles are carved into the tablet. Light the runes that belong to both circles.",
      math: ["A = {2, 4, 6, 8}", "B = {4, 8, 12}"],
      ask: "Select every element of A ∩ B.",
      answer: { kind: "set", options: ["2", "4", "6", "8", "12"], correct: ["4", "8"] },
      hints: [
        "∩ means “and”: an element must be in A and also in B.",
        "Go through A one element at a time and check whether it also appears in B.",
        "2 and 6 appear only in A, and 12 appears only in B.",
      ],
      solution: {
        steps: ["A ∩ B = { x : x ∈ A and x ∈ B }", "4 ∈ A and 4 ∈ B ✓   8 ∈ A and 8 ∈ B ✓", "2, 6 ∉ B and 12 ∉ A", "A ∩ B = {4, 8}"],
        explanation: "The intersection keeps only the elements the two sets share.",
      },
    },
    apprentice: {
      prompt: "The tablet asks which runes belong to the first circle but not the second.",
      math: ["A = {1, 2, 3, 4, 5}", "B = {4, 5, 6, 7}"],
      ask: "Select every element of A − B.",
      answer: { kind: "set", options: nums(1, 7), correct: ["1", "2", "3"] },
      hints: [
        "A − B (the difference) starts with A, not with B.",
        "Remove from A anything that also appears in B.",
        "4 and 5 are in both sets, so they are removed. 6 and 7 were never in A.",
      ],
      solution: {
        steps: ["A − B = { x : x ∈ A and x ∉ B }", "A ∩ B = {4, 5}, so remove 4 and 5 from A", "A − B = {1, 2, 3}"],
        explanation: "Set difference keeps elements of the first set that do not appear in the second.",
      },
    },
    challenger: {
      prompt: "The tablet's runes are numbered 1 to 10. Light the runes outside both carved circles.",
      math: ["U = {1, 2, …, 10}", "A = { x ∈ U : x is even }", "B = { x ∈ U : 3 divides x }"],
      ask: "Select every element of (A ∪ B)′, the complement of A ∪ B in U.",
      answer: { kind: "set", options: nums(1, 10), correct: ["1", "5", "7"] },
      hints: [
        "First list A and B explicitly, then form their union.",
        "A = {2, 4, 6, 8, 10} and B = {3, 6, 9}. The complement is everything in U not in A ∪ B.",
        "A ∪ B = {2, 3, 4, 6, 8, 9, 10}. Which numbers from 1 to 10 are missing?",
      ],
      solution: {
        steps: ["A = {2, 4, 6, 8, 10},  B = {3, 6, 9}", "A ∪ B = {2, 3, 4, 6, 8, 9, 10}", "(A ∪ B)′ = U − (A ∪ B) = {1, 5, 7}"],
        explanation: "By De Morgan's law this also equals A′ ∩ B′: the odd numbers not divisible by 3.",
      },
    },
    expert: {
      prompt: "A scroll beneath the tablet records a survey of the dungeon's 40 apprentices.",
      math: ["n(U) = 40", "n(P) = 22   (study Python)", "n(C) = 18   (study C)", "n(P ∩ C) = 7"],
      ask: "How many apprentices study neither language?",
      answer: { kind: "numeric", value: 7 },
      hints: [
        "Find how many study at least one language first.",
        "Use n(P ∪ C) = n(P) + n(C) − n(P ∩ C).",
        "n(P ∪ C) = 22 + 18 − 7 = 33. Now subtract from the total.",
      ],
      solution: {
        steps: ["n(P ∪ C) = n(P) + n(C) − n(P ∩ C)", "= 22 + 18 − 7 = 33", "Neither = n(U) − n(P ∪ C) = 40 − 33 = 7"],
        explanation: "Those in both groups are counted twice in n(P) + n(C), so we subtract the overlap once.",
      },
      wrongNudge: "Remember the 7 students in both groups are counted twice if you just add 22 + 18.",
    },
    mastermind: {
      prompt: "The tablet pairs every subset of three runes with a single rune.",
      math: ["A = {a, b, c}"],
      ask: "How many elements does 𝒫(A) × A contain?",
      answer: { kind: "numeric", value: 24 },
      hints: [
        "𝒫(A) is the power set: the set of all subsets of A, including ∅ and A itself.",
        "A set with n elements has 2ⁿ subsets, and |X × Y| = |X| · |Y|.",
        "|𝒫(A)| = 2³ = 8 and |A| = 3.",
      ],
      solution: {
        steps: ["|𝒫(A)| = 2³ = 8", "|A| = 3", "|𝒫(A) × A| = |𝒫(A)| · |A| = 8 · 3 = 24"],
        explanation: "Each element either is or isn't in a subset (2 choices, 3 times), and a Cartesian product pairs every element of one set with every element of the other.",
      },
      wrongNudge: "Did you count both the empty set and A itself as subsets?",
    },
    legendary: {
      prompt: "The final inscription records a census of 100 dungeon scholars.",
      math: [
        "n(M) = 45,  n(P) = 40,  n(C) = 35",
        "n(M ∩ P) = 15,  n(M ∩ C) = 12,  n(P ∩ C) = 10",
        "n(M ∩ P ∩ C) = 5,   n(U) = 100",
      ],
      ask: "How many scholars belong to none of M, P or C?",
      answer: { kind: "numeric", value: 12 },
      hints: [
        "Use the inclusion–exclusion principle for three sets.",
        "n(M ∪ P ∪ C) = Σ singles − Σ pairs + triple.",
        "Singles sum to 120 and pairs sum to 37. Don't forget to add back the triple overlap.",
      ],
      solution: {
        steps: ["n(M ∪ P ∪ C) = 45 + 40 + 35 − 15 − 12 − 10 + 5", "= 120 − 37 + 5 = 88", "None = 100 − 88 = 12"],
        explanation: "Subtracting pairwise overlaps removes the triple overlap three times after it was added three times, so it must be added back once.",
      },
      wrongNudge: "Check the sign of each term: + singles, − pairs, + triple.",
    },
  },
};

export const RELATIONS_PUZZLE: PuzzleDef = {
  id: "chest",
  title: "The Lock of Relations",
  topic: "Relations",
  variants: {
    amateur: {
      prompt: "The chest's lock dial asks you to count the ordered pairs in a relation.",
      math: ["A = {1, 2, 3}", "R = { (a, b) ∈ A × A : a < b }"],
      ask: "How many ordered pairs are in R?",
      answer: { kind: "numeric", value: 3 },
      hints: [
        "A relation on A is a set of ordered pairs (a, b) with a, b ∈ A.",
        "List every pair where the first number is strictly smaller than the second.",
        "Start with a = 1: (1, 2) and (1, 3). Then try a = 2 and a = 3.",
      ],
      solution: {
        steps: ["a = 1: (1, 2), (1, 3)", "a = 2: (2, 3)", "a = 3: no b ∈ A with 3 < b", "R = {(1,2), (1,3), (2,3)}, so |R| = 3"],
        explanation: "“Less than” is strict, so pairs like (1, 1) are not included.",
      },
      wrongNudge: "“<” is strict — pairs such as (2, 2) do not count.",
    },
    apprentice: {
      prompt: "Three brass levers are labelled with relation properties. Pull every lever that describes R.",
      math: ["A = {1, 2, 3}", "R = {(1,1), (2,2), (3,3), (1,2)}"],
      ask: "Which properties does R have? Select all that apply.",
      answer: { kind: "choice", options: ["Reflexive", "Symmetric", "Transitive"], correct: [0, 2], multi: true },
      hints: [
        "Check each property separately against its definition.",
        "Reflexive: (a, a) ∈ R for every a. Symmetric: (a, b) ∈ R ⇒ (b, a) ∈ R.",
        "(1, 2) ∈ R but (2, 1) ∉ R. For transitivity, check chains such as (1,1),(1,2) and (1,2),(2,2).",
      ],
      solution: {
        steps: [
          "Reflexive ✓ — (1,1), (2,2), (3,3) are all in R",
          "Symmetric ✗ — (1,2) ∈ R but (2,1) ∉ R",
          "Transitive ✓ — every chain (a,b),(b,c) gives (a,c) ∈ R; the only non-trivial chains are (1,1),(1,2) → (1,2) and (1,2),(2,2) → (1,2)",
        ],
        explanation: "R is reflexive and transitive but not symmetric (it is actually a partial order).",
      },
    },
    challenger: {
      prompt: "The lock is missing pieces. Add exactly the pairs needed to complete the transitive closure.",
      math: ["A = {1, 2, 3, 4}", "R = {(1,2), (2,3)}"],
      ask: "Select every pair that must be added to R to form its transitive closure.",
      answer: { kind: "set", options: ["(1,1)", "(1,3)", "(2,1)", "(3,1)", "(3,4)", "(2,4)"], correct: ["(1,3)"] },
      hints: [
        "The transitive closure is the smallest transitive relation containing R.",
        "Look for chains (a, b), (b, c) in R where (a, c) is missing.",
        "(1,2) and (2,3) form a chain. Is anything else needed once you add its result?",
      ],
      solution: {
        steps: ["Chain: (1,2), (2,3) ⇒ (1,3) is required", "New relation: {(1,2), (2,3), (1,3)}", "No further chains exist (nothing starts with 3), so it is transitive"],
        explanation: "Adding anything else would not be minimal, so the closure adds only (1,3).",
      },
    },
    expert: {
      prompt: "The chest counts every possible reflexive relation it could be locked with.",
      math: ["A = {a, b, c}"],
      ask: "How many reflexive relations exist on A?",
      answer: { kind: "numeric", value: 64 },
      hints: [
        "A × A has 9 ordered pairs. A relation is any subset of A × A.",
        "Reflexive means the 3 diagonal pairs (a,a), (b,b), (c,c) are forced in.",
        "The other 9 − 3 = 6 pairs can each be in or out freely.",
      ],
      solution: {
        steps: ["|A × A| = 3² = 9", "Diagonal pairs (3 of them) must be included", "Remaining 6 pairs are free: 2⁶ = 64"],
        explanation: "In general there are 2^(n² − n) reflexive relations on an n-element set.",
      },
      wrongNudge: "Only the off-diagonal pairs are free choices.",
    },
    mastermind: {
      prompt: "A larger lock: four runes, and the relation must read the same in both directions.",
      math: ["A = {1, 2, 3, 4}"],
      ask: "How many symmetric relations exist on A?",
      answer: { kind: "numeric", value: 1024 },
      hints: [
        "In a symmetric relation, (a, b) and (b, a) are either both in or both out.",
        "Count the independent choices: diagonal pairs, plus unordered pairs {a, b} with a ≠ b.",
        "There are 4 diagonal pairs and C(4, 2) = 6 off-diagonal pairs of pairs.",
      ],
      solution: {
        steps: ["Diagonal pairs (a, a): 4 independent choices", "Pairs {(a,b),(b,a)} with a ≠ b: C(4,2) = 6 choices", "Total: 2^(4 + 6) = 2¹⁰ = 1024"],
        explanation: "In general there are 2^(n(n+1)/2) symmetric relations on an n-element set.",
      },
      wrongNudge: "Treat (a,b) and (b,a) as one combined choice.",
    },
    legendary: {
      prompt: "The master lock counts every way to group four runes into families.",
      math: ["A = {1, 2, 3, 4}"],
      ask: "How many equivalence relations exist on A?",
      answer: { kind: "numeric", value: 15 },
      hints: [
        "Equivalence relations on a set correspond one-to-one with partitions of that set.",
        "Count partitions by block shape: 4, 3+1, 2+2, 2+1+1, 1+1+1+1.",
        "Shapes give 1, 4, 3, 6 and 1 partitions respectively.",
      ],
      solution: {
        steps: [
          "One block {1234}: 1",
          "3 + 1: choose the single element: 4",
          "2 + 2: C(4,2)/2 = 3",
          "2 + 1 + 1: choose the pair: C(4,2) = 6",
          "1 + 1 + 1 + 1: 1",
          "Total = 1 + 4 + 3 + 6 + 1 = 15  (the Bell number B₄)",
        ],
        explanation: "Each equivalence relation's classes form a partition, and every partition defines one equivalence relation.",
      },
      wrongNudge: "Count partitions of the set — and don't double-count the 2 + 2 split.",
    },
  },
};

export const CALCULUS_PUZZLE: PuzzleDef = {
  id: "crystal",
  title: "The Crystal of Functions",
  topic: "Functions & Calculus",
  variants: {
    amateur: {
      prompt: "The crystal hums when fed the right value of a function.",
      math: ["f(x) = 3x + 2"],
      ask: "Evaluate f(4).",
      answer: { kind: "numeric", value: 14 },
      hints: ["Replace every x with 4.", "f(4) = 3 · 4 + 2.", "3 · 4 = 12."],
      solution: { steps: ["f(4) = 3(4) + 2", "= 12 + 2", "= 14"], explanation: "Evaluating a function means substituting the input for the variable." },
      wrongNudge: "Multiply first, then add.",
    },
    apprentice: {
      prompt: "Two crystal facets combine their powers — one after the other.",
      math: ["f(x) = x² − 1", "g(x) = 2x"],
      ask: "Evaluate (f ∘ g)(3).",
      answer: { kind: "numeric", value: 35 },
      hints: ["(f ∘ g)(x) means f(g(x)): apply g first.", "g(3) = 6.", "Now compute f(6) = 6² − 1."],
      solution: { steps: ["g(3) = 2 · 3 = 6", "f(6) = 6² − 1 = 36 − 1", "(f ∘ g)(3) = 35"], explanation: "Composition applies the inner function first, then feeds its output to the outer one." },
      wrongNudge: "Order matters: f ∘ g means g first, then f.",
    },
    challenger: {
      prompt: "The crystal flickers at a point where the formula seems to break.",
      math: ["lim₍ₓ→₂₎  (x² − 4) / (x − 2)"],
      ask: "Find the value of the limit.",
      answer: { kind: "numeric", value: 4 },
      hints: [
        "Direct substitution gives 0/0, which is indeterminate — not the answer.",
        "Factor the numerator: x² − 4 is a difference of squares.",
        "(x² − 4)/(x − 2) = x + 2 for x ≠ 2.",
      ],
      solution: { steps: ["x² − 4 = (x − 2)(x + 2)", "For x ≠ 2: (x² − 4)/(x − 2) = x + 2", "lim₍ₓ→₂₎ (x + 2) = 4"], explanation: "A limit depends only on values near x = 2, so cancelling the common factor is valid." },
      wrongNudge: "0/0 is indeterminate — simplify before substituting.",
    },
    expert: {
      prompt: "The crystal's two halves must meet seamlessly at x = 1.",
      math: ["f(x) = 2x + k,  x < 1", "f(x) = x² + 3,  x ≥ 1"],
      ask: "Find k so that f is continuous at x = 1.",
      answer: { kind: "numeric", value: 2 },
      hints: [
        "Continuity at 1 requires the left limit, the right limit and f(1) to be equal.",
        "Left limit: 2(1) + k. Right limit and f(1): 1² + 3.",
        "Solve 2 + k = 4.",
      ],
      solution: { steps: ["lim₍ₓ→1⁻₎ f(x) = 2 + k", "lim₍ₓ→1⁺₎ f(x) = f(1) = 1 + 3 = 4", "2 + k = 4 ⇒ k = 2"], explanation: "With k = 2 both pieces approach 4, so there is no jump at x = 1." },
      wrongNudge: "Set the two one-sided limits equal at x = 1.",
    },
    mastermind: {
      prompt: "The crystal's light dips into a valley. Find where it is lowest nearby.",
      math: ["f(x) = x³ − 6x² + 9x + 1"],
      ask: "At what x-value does f have a local minimum?",
      answer: { kind: "numeric", value: 3 },
      hints: [
        "Stationary points occur where f′(x) = 0.",
        "f′(x) = 3x² − 12x + 9 = 3(x − 1)(x − 3).",
        "Use f″(x) = 6x − 12 to classify x = 1 and x = 3.",
      ],
      solution: {
        steps: ["f′(x) = 3x² − 12x + 9 = 3(x − 1)(x − 3)", "Stationary points: x = 1, x = 3", "f″(x) = 6x − 12:  f″(1) = −6 < 0 (max),  f″(3) = 6 > 0 (min)", "Local minimum at x = 3"],
        explanation: "A positive second derivative means the curve is concave up, so the stationary point is a minimum.",
      },
      wrongNudge: "One stationary point is a maximum — check the second derivative.",
    },
    legendary: {
      prompt: "The heart of the crystal holds a limit that hides behind 0/0.",
      math: ["lim₍ₓ→0₎  (1 − cos x) / x²"],
      ask: "Find the value of the limit (a fraction like 1/3 is accepted).",
      answer: { kind: "numeric", value: 0.5, placeholder: "e.g. 1/3 or 0.25" },
      hints: [
        "Substitution gives 0/0. Try multiplying by (1 + cos x)/(1 + cos x).",
        "1 − cos²x = sin²x, so the expression becomes (sin x / x)² · 1/(1 + cos x).",
        "lim₍ₓ→0₎ sin x / x = 1 and cos 0 = 1.",
      ],
      solution: {
        steps: [
          "(1 − cos x)/x² · (1 + cos x)/(1 + cos x) = sin²x / (x²(1 + cos x))",
          "= (sin x / x)² · 1/(1 + cos x)",
          "→ 1² · 1/(1 + 1) = 1/2",
        ],
        explanation: "The standard limit sin x / x → 1 does the heavy lifting once the expression is rewritten. (L'Hôpital's rule twice gives the same 1/2.)",
      },
      wrongNudge: "Use sin x / x → 1 after rewriting with 1 − cos²x = sin²x.",
    },
  },
};

export const DUNGEON_PUZZLES = [SETS_PUZZLE, RELATIONS_PUZZLE, CALCULUS_PUZZLE];

/** Gate door bounds (percent of room). */
export const GATE = { x: 33.3, y: 21.2, w: 28.2, h: 54.3 };
/** Rune sockets on the gate arch, one per puzzle in order. */
export const SOCKETS = [
  { x: 32.6, y: 12.4, d: 6.2 },
  { x: 44, y: 4.1, d: 6.2 },
  { x: 56.25, y: 12.4, d: 6.2 },
];

export const DUNGEON_HOTSPOTS: Hotspot[] = [
  { id: "tablet", label: "Carved Tablet", x: 7.5, y: 18, w: 10, h: 42, puzzleId: "tablet" },
  { id: "chest", label: "Treasure Chest", x: 0.5, y: 65, w: 14.5, h: 19, puzzleId: "chest" },
  { id: "crystal", label: "Crystal Altar", x: 78.5, y: 38, w: 12.5, h: 35, puzzleId: "crystal" },
  { id: "gate", label: "Rune Gate", x: GATE.x, y: GATE.y, w: GATE.w, h: GATE.h },
  { id: "torch-1", label: "Wall Torch", x: 1.5, y: 22, w: 5, h: 15, effect: "flare", lines: ["The flame leaps as you lean in. Warm — and very real.", "Someone refilled this torch recently. Curious…"] },
  { id: "torch-2", label: "Wall Torch", x: 19.5, y: 32, w: 4.5, h: 12, effect: "flare", lines: ["The torch crackles. Its light falls exactly on the carved tablet.", "Soot marks above it form a faint ∩ shape."] },
  { id: "chain", label: "Hanging Chain", x: 74.5, y: 0, w: 4, h: 41, effect: "wiggle", lines: ["You tug the chain. It rattles… and nothing else happens.", "Each link connects to the next — a little like a transitive relation."] },
  { id: "owl", label: "Stone Owl", x: 90.5, y: 17, w: 9, h: 27, effect: "wiggle", labelBelow: true, lines: ["The owl's stone eyes seem to follow you. Suspicious.", "“Hoo… hoo knows the derivative?” — you swear it whispered.", "There's a tiny f′(x) scratched under its wing."] },
  { id: "rubble", label: "Loose Stone", x: 82, y: 82, w: 12, h: 15, effect: "wiggle", labelBelow: true, lines: ["The block shifts a little. Underneath: dust, and one very surprised beetle.", "It's just a rock. A mathematically uninteresting rock."] },
  { id: "ruins", label: "Distant Ruins", x: 73, y: 46, w: 5, h: 26, lines: ["Beyond the arch, a waterfall pours into the dark. No way out there."] },
];
