import type { Element } from "./types";
import { temperamentOf } from "./temperament";
import signs from "./data/zodiac-signs.json";
import {
  ACTIVITIES, DIM_COPY, DIM_FALLBACK, ELEMENT_VI, LIFEPATH_COPY, TIERS, ZODIAC_COPY,
  type Dim, type FactorLines, type LifePathCase, type TierId, type ZodiacCase,
} from "./compatCopy";

export type { Dim, FactorLines, LifePathCase, TierId, ZodiacCase } from "./compatCopy";

/** "Hợp nhau" scoring — docs/hop-nhau-spec.md §1. Pure, symmetric, deterministic. */
export interface CompatPerson {
  type?: string;
  sign: string;
  element: Element;
  lifePath: number;
}

export interface CompatResult {
  personality: { score: number; best: Dim | null; clash: Dim | null; lines: FactorLines } | null;
  zodiac: { score: number; case: ZodiacCase; lines: FactorLines };
  lifePath: { score: number; case: LifePathCase; masterNote: string | null; lines: FactorLines };
  total: number | null;
  range: { min: number; max: number };
  tier: { id: TierId; label: string; line: string } | null;
  activities: readonly [string, string, string] | null;
}

const SIGN_ORDER = (signs as { sun_sign: string }[]).map((s) => s.sun_sign);

/** S/N +30, J/P +20, T/F +15 when shared; E/I +20 when different, +15 when same; base 15. */
export function personalityScore(a: string, b: string): number {
  return (a[1] === b[1] ? 30 : 0) + (a[3] === b[3] ? 20 : 0) + (a[2] === b[2] ? 15 : 0) + (a[0] !== b[0] ? 20 : 15) + 15;
}

export function zodiacScore(a: CompatPerson, b: CompatPerson): { score: number; case: ZodiacCase } {
  if (a.sign === b.sign) return { score: 92, case: "sameSign" };
  if (a.element === b.element) return { score: 88, case: "sameElement" };
  const pair = [a.element, b.element].sort().join("|");
  if (pair === "Air|Fire" || pair === "Earth|Water") return { score: 80, case: "complement" };
  return { score: 65, case: "other" };
}

export function reduceMaster(n: number): number {
  return n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n;
}

const groupOf = (n: number) => ([1, 5, 7].includes(n) ? 0 : [2, 4, 8].includes(n) ? 1 : 2);

export function lifePathScore(a: number, b: number): { score: number; case: LifePathCase } {
  const x = reduceMaster(a);
  const y = reduceMaster(b);
  if (x === y) return { score: 90, case: "sameRoot" };
  if (groupOf(x) === groupOf(y)) return { score: 85, case: "sameGroup" };
  return { score: 70, case: "diffGroup" };
}

export function compatTotal(p: number, z: number, l: number): number {
  return Math.min(100, Math.max(45, Math.round((4 * p + 3 * z + 3 * l) / 10)));
}

export function tierFor(total: number): TierId {
  if (total >= 90) return "bai-trung";
  if (total >= 80) return "hop-ca";
  if (total >= 70) return "bo-sung";
  if (total >= 60) return "them-thoi-gian";
  return "oan-gia";
}

/** FNV-1a 32-bit: picks the tier variant without randomness. */
function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

const DIMS: { dim: Dim; at: number; goodWhenSame: boolean }[] = [
  { dim: "SN", at: 1, goodWhenSame: true },
  { dim: "JP", at: 3, goodWhenSame: true },
  { dim: "TF", at: 2, goodWhenSame: true },
  { dim: "EI", at: 0, goodWhenSame: false },
];

export function compatResult(a: CompatPerson, b: CompatPerson): CompatResult {
  const z = zodiacScore(a, b);
  const l = lifePathScore(a.lifePath, b.lifePath);

  // Sign names in calendar order so both people read the same sentence.
  const [s1, s2] = [a.sign, b.sign].sort((x, y) => SIGN_ORDER.indexOf(x) - SIGN_ORDER.indexOf(y));
  const fill = (t: string) => t.replace("{signA}", s1!).replace("{signB}", s2!).replace("{el}", ELEMENT_VI[a.element]);
  const zl = ZODIAC_COPY[z.case];

  const hi = Math.max(a.lifePath, b.lifePath);
  const lo = Math.min(a.lifePath, b.lifePath);
  const masterNote = l.case === "sameRoot" && hi !== lo ? `${hi} rút gọn về ${lo} nên hai đứa cùng gốc số` : null;

  let personality: CompatResult["personality"] = null;
  let total: number | null = null;
  let tier: CompatResult["tier"] = null;
  let activities: CompatResult["activities"] = null;

  if (a.type && b.type) {
    const ta = a.type;
    const tb = b.type;
    const good = DIMS.map((d) => (ta[d.at] === tb[d.at]) === d.goodWhenSame);
    const bestIdx = good.indexOf(true);
    const clashIdx = good.indexOf(false);
    const best = bestIdx >= 0 ? DIMS[bestIdx]!.dim : null;
    const clash = clashIdx >= 0 ? DIMS[clashIdx]!.dim : null;
    const p = personalityScore(ta, tb);
    personality = {
      score: p,
      best,
      clash,
      lines: {
        match: best ? DIM_COPY[best].match : DIM_FALLBACK.noneGood,
        clash: clash ? DIM_COPY[clash].clash : DIM_FALLBACK.allGood,
      },
    };
    total = compatTotal(p, z.score, l.score);
    const id = tierFor(total);
    const key = (x: CompatPerson) => `${x.type ?? "-"}|${x.sign}|${x.lifePath}`;
    const variant = fnv1a32([key(a), key(b)].sort().join("~")) % 2;
    tier = { id, label: TIERS[id].label, line: TIERS[id].lines[variant]! };
    activities = ACTIVITIES[[temperamentOf(ta), temperamentOf(tb)].sort().join("|")] ?? null;
  }

  return {
    personality,
    zodiac: { score: z.score, case: z.case, lines: { match: fill(zl.match), clash: fill(zl.clash) } },
    lifePath: { score: l.score, case: l.case, masterNote, lines: LIFEPATH_COPY[l.case] },
    total,
    range: { min: compatTotal(30, z.score, l.score), max: compatTotal(100, z.score, l.score) },
    tier,
    activities,
  };
}
