import type { Element, PersonalProfile } from "./types";
import type { CompatPerson } from "./compat";
import { calculateZodiac } from "./zodiac";
import { calculateNumerology } from "./numerology";
import signs from "./data/zodiac-signs.json";

/**
 * "Hợp nhau" invite data. Only what scoring needs travels in the URL:
 * type, sign index, life path. Never the birth date, name or school.
 * The display name rides after `#`, so no server ever receives it.
 */
export interface InvitePayload {
  v: 1;
  type: string;
  sign: number;
  lifePath: number;
}

const SIGNS = signs as { sun_sign: string; element: Element }[];
const TYPES = new Set(
  ["E", "I"].flatMap((a) => ["S", "N"].flatMap((b) => ["T", "F"].flatMap((c) => ["J", "P"].map((d) => a + b + c + d)))),
);
const LIFE_PATHS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]);
const MAX_CODE = 300;
const MAX_NAME = 30;
const PATH = "/personal-definition/hop-nhau";

export function inviteFromProfile(p: PersonalProfile): InvitePayload {
  return {
    v: 1,
    type: p.mbti.type,
    sign: SIGNS.findIndex((s) => s.sun_sign === p.zodiac.sun_sign),
    lifePath: p.numerology.life_path,
  };
}

export function encodeInvite(p: InvitePayload): string {
  const bytes = new TextEncoder().encode(JSON.stringify({ v: p.v, type: p.type, sign: p.sign, lifePath: p.lifePath }));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Never throws: anything malformed, truncated or out of range is null. */
export function decodeInvite(code: string | null | undefined): InvitePayload | null {
  if (!code || code.length > MAX_CODE || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    const json = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    const o: unknown = JSON.parse(json);
    if (!o || typeof o !== "object" || Array.isArray(o)) return null;
    const { v, type, sign, lifePath } = o as Record<string, unknown>;
    if (v !== 1) return null;
    if (typeof type !== "string" || !TYPES.has(type)) return null;
    if (typeof sign !== "number" || !Number.isInteger(sign) || sign < 0 || sign >= SIGNS.length) return null;
    if (typeof lifePath !== "number" || !LIFE_PATHS.has(lifePath)) return null;
    return { v: 1, type, sign, lifePath };
  } catch {
    return null;
  }
}

export function personFromInvite(p: InvitePayload): CompatPerson & { type: string } {
  const s = SIGNS[p.sign];
  if (!s) throw new Error("personFromInvite: sign index out of range");
  return { type: p.type, sign: s.sun_sign, element: s.element, lifePath: p.lifePath };
}

export function personFromProfile(p: PersonalProfile): CompatPerson & { type: string } {
  return { type: p.mbti.type, sign: p.zodiac.sun_sign, element: p.zodiac.element, lifePath: p.numerology.life_path };
}

/** No type yet. Life path depends only on the date; "A" satisfies the name argument. */
export function personFromBirthDate(isoDate: string): CompatPerson {
  const z = calculateZodiac(isoDate);
  return { sign: z.sun_sign, element: z.element, lifePath: calculateNumerology(isoDate, "A").life_path };
}

export function cleanName(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const s = raw.replace(/\p{Cc}/gu, "").trim();
  if (!s || [...s].length > MAX_NAME) return null;
  return s;
}

export function readHashNames(hash: string): { n: string | null; m: string | null } {
  try {
    const q = hash.replace(/^#/, "");
    // URLSearchParams silently keeps bad escapes; check them strictly first.
    for (const part of q.split("&")) decodeURIComponent(part);
    const params = new URLSearchParams(q);
    return { n: cleanName(params.get("n")), m: cleanName(params.get("m")) };
  } catch {
    return { n: null, m: null };
  }
}

function hashOf(parts: [string, string | null][]): string {
  const kept = parts.filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`);
  return kept.length ? `#${kept.join("&")}` : "";
}

export function buildInviteUrl(origin: string, code: string, name: string | null): string {
  return `${origin}${PATH}?i=${code}${hashOf([["n", name]])}`;
}

export function buildPairUrl(
  origin: string, codeA: string, codeB: string, nameA: string | null, nameB: string | null,
): string {
  return `${origin}${PATH}?i=${codeA}&j=${codeB}${hashOf([["n", nameA], ["m", nameB]])}`;
}
