import type { Response } from "./types";
import questionBank from "./data/questions.json";
import { indicesOfPart, PART_COUNT } from "./parts";
import { POLE_NAMES } from "./poles";
import { SUMMARY_COPY } from "./interludeCopy";

type Dimension = keyof typeof questionBank.poles;
const ITEMS = questionBank.items as { dimension: Dimension; key: 1 | -1 }[];

/** A lean of at least this many of the part's 10 answers reads as "clear". */
export const CLEAR_LEAN = 7;

export interface PartSummary {
  letter: string;
  poleName: string;
  /** Answers that leaned toward `letter` (neutral answers count for neither side). */
  n: number;
  clear: boolean;
  text: string;
  /** Shown under the "Mách nhỏ" label. */
  tip: string;
}

/**
 * The break-screen conclusion for one finished part (part N = one dimension).
 *
 * The letter is decided exactly like scoreMBTI — sign of S = Σ(r × key), a
 * tie going to the bank's default pole — so it always matches the final
 * type. "Clear" (n ≥ 7, count shown) can never disagree with that sign: the
 * leaning side contributes at least +7, the other at most 3 × −2 = −6.
 * Anything less is "balanced" and shows no count.
 */
export function summarizePart(part: number, responses: readonly (Response | null)[]): PartSummary {
  const indices = indicesOfPart(part);
  const dimension = ITEMS[indices[0]!]!.dimension;
  const poles = questionBank.poles[dimension];

  let s = 0;
  let towardFirst = 0;
  let towardSecond = 0;
  for (const i of indices) {
    const v = (responses[i] ?? 0) * ITEMS[i]!.key;
    s += v;
    if (v > 0) towardFirst++;
    else if (v < 0) towardSecond++;
  }

  const letter = s > 0 ? poles.first : s < 0 ? poles.second : questionBank.defaults[dimension];
  const n = letter === poles.first ? towardFirst : towardSecond;
  const clear = n >= CLEAR_LEAN;
  const line = clear ? SUMMARY_COPY[letter]!.clear : SUMMARY_COPY[letter]!.balanced;

  return {
    letter,
    poleName: POLE_NAMES[letter]!,
    n,
    clear,
    text: line.text.replace("{n}", String(n)),
    tip: line.tip,
  };
}

/** One slot per part: the letter once that part is done, otherwise null. */
export function revealedLetters(lastDone: number, responses: readonly (Response | null)[]): (string | null)[] {
  return Array.from({ length: PART_COUNT }, (_, p) => (p <= lastDone ? summarizePart(p, responses).letter : null));
}
