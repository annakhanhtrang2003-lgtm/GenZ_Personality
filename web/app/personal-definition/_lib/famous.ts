import data from "./data/famous-birthdays.json";
import profiles from "./data/astro-profiles.json";
import { calculateNumerology } from "./numerology";
import { calculateZodiac } from "./zodiac";

export interface FamousPerson {
  name: string;
  known_for: string;
  birth_date: string;
  life_path: number;
  sun_sign: string;
}

/**
 * Well-known people with their số chủ đạo and cung hoàng đạo computed by the
 * same calculators as the user's result (only the life path is used, so the
 * name argument is a placeholder). Stored order is kept: Vietnamese names
 * come first in the data file.
 */
export const FAMOUS: readonly FamousPerson[] = data.people.map((p) => ({
  ...p,
  life_path: calculateNumerology(p.birth_date, "A").life_path,
  sun_sign: calculateZodiac(p.birth_date).sun_sign,
}));

export function famousWithLifePath(n: number, limit = 4): FamousPerson[] {
  return FAMOUS.filter((p) => p.life_path === n).slice(0, limit);
}

export function famousWithSign(sign: string, limit = 4): FamousPerson[] {
  return FAMOUS.filter((p) => p.sun_sign === sign).slice(0, limit);
}

export function zodiacProfile(sign: string): { self: string; others: string } | undefined {
  return (profiles.zodiac as Record<string, { self: string; others: string }>)[sign];
}

export function lifePathOthers(n: number): string | undefined {
  return (profiles.life_path as Record<string, { others: string }>)[String(n)]?.others;
}
