import { describe, it, expect } from "vitest";
import { summarizePart, revealedLetters } from "../partSummary";
import { SUMMARY_COPY, PART_HOOKS, RESULT_HOOK } from "../interludeCopy";
import { scoreMBTI } from "../mbti";
import { PART_COUNT, indicesOfPart } from "../parts";
import { QUESTION_COUNT } from "../likert";
import questionBank from "../data/questions.json";
import type { Response } from "../types";

const ITEMS = questionBank.items as { dimension: string; key: 1 | -1 }[];
const empty = (): (Response | null)[] => Array.from({ length: QUESTION_COUNT }, () => null);

/** Answer part `part` so that `lean` items point at the first pole, `against` at the second, rest neutral. */
function answerPart(part: number, lean: number, against: number, strength: 1 | 2 = 1) {
  const r = empty();
  indicesOfPart(part).forEach((idx, k) => {
    const key = ITEMS[idx]!.key;
    const toward = k < lean ? 1 : k < lean + against ? -1 : 0;
    r[idx] = (toward * key * strength) as Response;
  });
  return r;
}

describe("summarizePart", () => {
  it("calls a 7+/10 lean clear and shows the count", () => {
    const s = summarizePart(0, answerPart(0, 3, 7)); // 7 toward I (second pole of EI)
    expect(s.letter).toBe("I");
    expect(s.clear).toBe(true);
    expect(s.n).toBe(7);
    expect(s.text).toContain("Hướng nội (7/10)");
  });

  it("calls 6-4 balanced and shows no count", () => {
    const s = summarizePart(1, answerPart(1, 6, 4));
    expect(s.letter).toBe("S");
    expect(s.clear).toBe(false);
    expect(s.text).not.toMatch(/\d+\/10/);
    expect(s.text).toContain("cân bằng");
  });

  it("resolves a dead tie to the default pole, like the scorer", () => {
    expect(summarizePart(2, answerPart(2, 5, 5)).letter).toBe("F");
    expect(summarizePart(3, answerPart(3, 0, 0)).letter).toBe("P");
  });

  it("does not count neutral answers for either side", () => {
    const s = summarizePart(3, answerPart(3, 7, 0)); // 7 J, 3 neutral
    expect(s).toMatchObject({ letter: "J", clear: true, n: 7 });
  });

  it("always reveals the same letter the final type will have", () => {
    // Deterministic pseudo-random sweep over full answer sheets.
    let seed = 7;
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    for (let trial = 0; trial < 300; trial++) {
      const r = Array.from({ length: QUESTION_COUNT }, () => (Math.floor(rand() * 5) - 2) as Response);
      const type = scoreMBTI(r).type;
      for (let part = 0; part < PART_COUNT; part++) {
        expect(summarizePart(part, r).letter).toBe(type[part]);
      }
    }
  });
});

describe("revealedLetters", () => {
  it("shows letters for finished parts and blanks for the rest", () => {
    const r = answerPart(0, 0, 8);
    expect(revealedLetters(0, r)).toEqual(["I", null, null, null]);
  });
});

describe("interlude copy", () => {
  it("has a clear line (with {n}) and a balanced line for all 8 letters, each at most 2 sentences", () => {
    for (const letter of ["E", "I", "S", "N", "T", "F", "J", "P"]) {
      const c = SUMMARY_COPY[letter]!;
      expect(c.clear).toContain("{n}/10");
      expect(c.balanced).not.toContain("{n}");
      for (const line of [c.clear, c.balanced]) {
        const sentences = line.split(/[.!?](?:\s|$)/).filter((x) => x.trim());
        expect(sentences.length).toBeLessThanOrEqual(2);
      }
    }
  });

  it("has a hook for every part after the first, and one for the result", () => {
    expect(PART_HOOKS).toHaveLength(PART_COUNT);
    expect(RESULT_HOOK.length).toBeGreaterThan(0);
  });
});
