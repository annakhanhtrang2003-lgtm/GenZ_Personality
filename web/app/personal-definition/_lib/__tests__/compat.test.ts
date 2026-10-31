import { describe, it, expect } from "vitest";
import {
  compatResult,
  compatTotal,
  lifePathScore,
  personalityScore,
  reduceMaster,
  tierFor,
  zodiacScore,
  type CompatPerson,
  type TierId,
} from "../compat";
import { ACTIVITIES, DIM_COPY, DIM_FALLBACK, LIFEPATH_COPY, TIERS, ZODIAC_COPY } from "../compatCopy";
import signs from "../data/zodiac-signs.json";
import type { Element } from "../types";

const TYPES: string[] = [];
for (const a of "EI") for (const b of "SN") for (const c of "TF") for (const d of "JP") TYPES.push(a + b + c + d);
const LIFE_PATHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
const SIGN_ROWS = signs as { sun_sign: string; element: Element }[];

const person = (type: string | undefined, signIndex: number, lifePath: number): CompatPerson => ({
  ...(type ? { type } : {}),
  sign: SIGN_ROWS[signIndex]!.sun_sign,
  element: SIGN_ROWS[signIndex]!.element,
  lifePath,
});
const sign = (name: string) => SIGN_ROWS.findIndex((s) => s.sun_sign === name);

/** Seeded LCG so the "random" pairs are the same on every run. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}
const pick = <T,>(r: () => number, xs: T[]) => xs[Math.floor(r() * xs.length)]!;
const randomPerson = (r: () => number) => person(pick(r, TYPES), Math.floor(r() * 12), pick(r, LIFE_PATHS));

describe("personalityScore", () => {
  it("scores the spec's examples", () => {
    expect(personalityScore("INFP", "INFP")).toBe(95);
    expect(personalityScore("INFP", "ENFP")).toBe(100);
    expect(personalityScore("ESTJ", "INFP")).toBe(35);
    expect(personalityScore("ISTJ", "INFP")).toBe(30);
  });

  it("stays within 30..100 for every pair of types", () => {
    for (const a of TYPES) for (const b of TYPES) {
      const p = personalityScore(a, b);
      expect(p).toBeGreaterThanOrEqual(30);
      expect(p).toBeLessThanOrEqual(100);
    }
  });
});

describe("zodiacScore", () => {
  it("gives 92 to two people of the same sign", () => {
    for (let i = 0; i < 12; i++) expect(zodiacScore(person(undefined, i, 1), person(undefined, i, 1))).toEqual({ score: 92, case: "sameSign" });
  });

  it("gives 88 for the same element, 80 for Fire–Air / Earth–Water", () => {
    expect(zodiacScore(person(undefined, sign("Bạch Dương"), 1), person(undefined, sign("Sư Tử"), 1))).toEqual({ score: 88, case: "sameElement" });
    expect(zodiacScore(person(undefined, sign("Bạch Dương"), 1), person(undefined, sign("Song Tử"), 1))).toEqual({ score: 80, case: "complement" });
    expect(zodiacScore(person(undefined, sign("Kim Ngưu"), 1), person(undefined, sign("Cự Giải"), 1))).toEqual({ score: 80, case: "complement" });
  });

  it("gives 65 to elements that are neither the same nor complementary", () => {
    // Fire–Earth, Fire–Water, Air–Earth, Air–Water
    for (const [x, y] of [["Bạch Dương", "Kim Ngưu"], ["Sư Tử", "Bọ Cạp"], ["Song Tử", "Ma Kết"], ["Bảo Bình", "Song Ngư"]]) {
      expect(zodiacScore(person(undefined, sign(x!), 1), person(undefined, sign(y!), 1))).toEqual({ score: 65, case: "other" });
    }
  });
});

describe("life path and master numbers", () => {
  it("reduces 11→2, 22→4, 33→6 and leaves the rest", () => {
    expect([11, 22, 33].map(reduceMaster)).toEqual([2, 4, 6]);
    for (let n = 1; n <= 9; n++) expect(reduceMaster(n)).toBe(n);
  });

  it("treats a master number and its root as the same root", () => {
    expect(lifePathScore(22, 4)).toEqual({ score: 90, case: "sameRoot" });
    expect(lifePathScore(11, 2)).toEqual({ score: 90, case: "sameRoot" });
    expect(lifePathScore(33, 6)).toEqual({ score: 90, case: "sameRoot" });
  });

  it("puts 11 and 22 in the same group, not the same root", () => {
    expect(lifePathScore(11, 22)).toEqual({ score: 85, case: "sameGroup" });
    expect(lifePathScore(33, 3)).toEqual({ score: 85, case: "sameGroup" });
  });

  it("scores same group 85 and different groups 70", () => {
    expect(lifePathScore(1, 5)).toEqual({ score: 85, case: "sameGroup" });
    expect(lifePathScore(1, 2)).toEqual({ score: 70, case: "diffGroup" });
  });

  it("explains the shared root only when the raw numbers differ", () => {
    expect(compatResult(person("INFP", 0, 22), person("INFP", 0, 4)).lifePath.masterNote).toBe("22 rút gọn về 4 nên hai đứa cùng gốc số");
    expect(compatResult(person("INFP", 0, 4), person("INFP", 0, 22)).lifePath.masterNote).toBe("22 rút gọn về 4 nên hai đứa cùng gốc số");
    expect(compatResult(person("INFP", 0, 4), person("INFP", 0, 4)).lifePath.masterNote).toBeNull();
    expect(compatResult(person("INFP", 0, 11), person("INFP", 0, 22)).lifePath.masterNote).toBeNull();
  });
});

describe("compatTotal and tiers", () => {
  it("weights 40/30/30 in integer math and clamps to 45..100", () => {
    expect(compatTotal(30, 65, 70)).toBe(53);
    expect(compatTotal(100, 92, 90)).toBe(95);
    expect(compatTotal(0, 0, 0)).toBe(45);
  });

  it("maps totals onto the five tiers at the spec's boundaries", () => {
    const cases: [number, TierId][] = [
      [90, "bai-trung"], [89, "hop-ca"], [80, "hop-ca"], [79, "bo-sung"], [70, "bo-sung"],
      [69, "them-thoi-gian"], [60, "them-thoi-gian"], [59, "oan-gia"], [45, "oan-gia"],
    ];
    for (const [t, id] of cases) expect(tierFor(t)).toBe(id);
  });

  it("never scores below 45, and every tier is reachable", () => {
    const seen = new Set<TierId>();
    let min = Infinity;
    let max = -Infinity;
    for (const a of TYPES) for (const b of TYPES) for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
      for (const [x, y] of [[1, 1], [1, 5], [1, 2]] as const) {
        const r = compatResult(person(a, i, x), person(b, j, y));
        min = Math.min(min, r.total!);
        max = Math.max(max, r.total!);
        seen.add(r.tier!.id);
      }
    }
    expect(min).toBeGreaterThanOrEqual(45);
    expect(min).toBe(53);
    expect(max).toBe(95);
    expect(seen.size).toBe(5);
  });
});

describe("symmetry", () => {
  it("hop(A,B) equals hop(B,A) for 500 random pairs, every field included", () => {
    const r = rng(20261031);
    for (let k = 0; k < 500; k++) {
      const a = randomPerson(r);
      const b = randomPerson(r);
      expect(compatResult(a, b)).toEqual(compatResult(b, a));
    }
  });

  it("is symmetric over all type pairs and all sign pairs", () => {
    for (const a of TYPES) for (const b of TYPES) {
      expect(compatResult(person(a, 0, 1), person(b, 3, 22))).toEqual(compatResult(person(b, 3, 22), person(a, 0, 1)));
    }
    for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
      expect(compatResult(person("INFP", i, 7), person("ESTJ", j, 11))).toEqual(compatResult(person("ESTJ", j, 11), person("INFP", i, 7)));
    }
  });

  it("is deterministic: the same input always gives the same result", () => {
    const a = person("ENTJ", 9, 33);
    const b = person("ISFP", 4, 2);
    expect(compatResult(a, b)).toEqual(compatResult(a, b));
  });
});

describe("compatResult details", () => {
  it("picks the best and clash dimensions in S/N, J/P, T/F, E/I order", () => {
    const allGood = compatResult(person("INFP", 0, 1), person("ENFP", 0, 1)).personality!;
    expect(allGood.best).toBe("SN");
    expect(allGood.clash).toBeNull();
    expect(allGood.lines.clash).toBe(DIM_FALLBACK.allGood);

    const noneGood = compatResult(person("ISTJ", 0, 1), person("INFP", 0, 1)).personality!;
    expect(noneGood.best).toBeNull();
    expect(noneGood.clash).toBe("SN");
    expect(noneGood.lines.match).toBe(DIM_FALLBACK.noneGood);

    const mixed = compatResult(person("ESFJ", 0, 1), person("ENFP", 0, 1)).personality!;
    expect(mixed.best).toBe("TF");
    expect(mixed.clash).toBe("SN");
    expect(mixed.lines).toEqual({ match: DIM_COPY.TF.match, clash: DIM_COPY.SN.clash });
  });

  it("fills sign names in calendar order and the element in Vietnamese", () => {
    const r = compatResult(person("INFP", sign("Sư Tử"), 1), person("INFP", sign("Bạch Dương"), 1));
    expect(r.zodiac.lines.match).toContain("Bạch Dương và Sư Tử");
    expect(r.zodiac.lines.match).toContain("Lửa");
  });

  it("returns only the zodiac + life-path part when someone has not taken the test", () => {
    const r = compatResult(person(undefined, 0, 4), person("INFP", 11, 8));
    expect(r.personality).toBeNull();
    expect(r.total).toBeNull();
    expect(r.tier).toBeNull();
    expect(r.activities).toBeNull();
    expect(r.range).toEqual({ min: compatTotal(30, r.zodiac.score, r.lifePath.score), max: compatTotal(100, r.zodiac.score, r.lifePath.score) });
  });

  it("chooses a tier line that is one of the tier's variants, the same in both orders", () => {
    const a = person("INTJ", 2, 5);
    const b = person("ENFJ", 6, 9);
    const r = compatResult(a, b);
    expect(TIERS[r.tier!.id].lines).toContain(r.tier!.line);
    expect(compatResult(b, a).tier!.line).toBe(r.tier!.line);
  });

  it("uses both variants across pairs (the hash is not stuck on one)", () => {
    const r = rng(7);
    const lines = new Set<string>();
    for (let k = 0; k < 200; k++) {
      const res = compatResult(randomPerson(r), randomPerson(r));
      if (res.tier!.id === "bo-sung") lines.add(res.tier!.line);
    }
    expect(lines.size).toBe(2);
  });

  it("gives three activities for the pair of temperaments", () => {
    const r = compatResult(person("INTJ", 0, 1), person("ESFP", 0, 1));
    expect(r.activities).toEqual(ACTIVITIES["analysts|explorers"]);
  });
});

describe("copy rules", () => {
  const all = (): string[] => [
    ...Object.values(TIERS).flatMap((t) => [t.label, ...t.lines]),
    ...Object.values(DIM_COPY).flatMap((d) => [d.match, d.clash]),
    DIM_FALLBACK.noneGood,
    DIM_FALLBACK.allGood,
    ...Object.values(ZODIAC_COPY).flatMap((z) => [z.match, z.clash]),
    ...Object.values(LIFEPATH_COPY).flatMap((l) => [l.match, l.clash]),
    ...Object.values(ACTIVITIES).flat(),
  ];

  it("never says MBTI, never uses dashes, never names a person, avoids sad words", () => {
    for (const line of all()) {
      expect(line).not.toMatch(/MBTI/);
      expect(line).not.toMatch(/[—–]| - /);
      expect(line).not.toMatch(/\{X\}/);
      expect(line).not.toMatch(/chia tay|định mệnh|số phận|xui|khắc/i);
    }
  });

  it("keeps every line within 90 characters, even with the longest sign names", () => {
    for (const line of all()) {
      const filled = line.replace(/\{signA\}|\{signB\}/g, "Thiên Bình").replace(/\{el\}/g, "Nước");
      expect(filled.length, filled).toBeLessThanOrEqual(90);
    }
  });

  it("has one activity triple for each of the 10 temperament pairs, keys sorted", () => {
    const keys = Object.keys(ACTIVITIES);
    expect(keys).toHaveLength(10);
    for (const k of keys) {
      const [a, b] = k.split("|");
      expect(a! <= b!).toBe(true);
    }
  });
});
