import { describe, it, expect } from "vitest";
import { famousWithLifePath, famousWithSign, FAMOUS } from "../famous";
import { calculateNumerology } from "../numerology";
import { calculateZodiac } from "../zodiac";
import profiles from "../data/astro-profiles.json";

const SIGNS = ["Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

describe("famous people", () => {
  it("derives every person's number and sign with the app's own calculators", () => {
    for (const p of FAMOUS) {
      expect(p.life_path).toBe(calculateNumerology(p.birth_date, "A").life_path);
      expect(p.sun_sign).toBe(calculateZodiac(p.birth_date).sun_sign);
    }
  });

  it("only returns people who really share the number / sign", () => {
    for (const n of NUMBERS) for (const p of famousWithLifePath(n)) expect(p.life_path).toBe(n);
    for (const s of SIGNS) for (const p of famousWithSign(s)) expect(p.sun_sign).toBe(s);
  });

  it("has at least one example for every number and two for every sign", () => {
    for (const n of NUMBERS) expect(famousWithLifePath(n).length, `số ${n}`).toBeGreaterThanOrEqual(1);
    for (const s of SIGNS) expect(famousWithSign(s).length, s).toBeGreaterThanOrEqual(2);
  });

  it("caps the list and keeps file order (Vietnamese names are listed first)", () => {
    expect(famousWithLifePath(9, 3)).toHaveLength(3);
    expect(famousWithLifePath(9, 3)[0]!.name).toBe("Mỹ Tâm");
  });

  it("knows Obama is số 2 by this method, not 4", () => {
    expect(FAMOUS.find((p) => p.name === "Barack Obama")!.life_path).toBe(2);
  });
});

describe("astro profiles copy", () => {
  it("covers all 12 signs with 'self' and 'others', and all 12 numbers with 'others'", () => {
    for (const s of SIGNS) {
      const z = (profiles.zodiac as Record<string, { self: string; others: string }>)[s]!;
      expect(z.self.length, s).toBeGreaterThan(20);
      expect(z.others.length, s).toBeGreaterThan(20);
    }
    for (const n of NUMBERS) {
      expect((profiles.life_path as Record<string, { others: string }>)[String(n)]!.others.length).toBeGreaterThan(20);
    }
  });

  it("never strings sentences together with a dash", () => {
    const all = [
      ...Object.values(profiles.zodiac).flatMap((z) => [z.self, z.others]),
      ...Object.values(profiles.life_path).map((l) => l.others),
    ];
    for (const line of all) expect(line).not.toMatch(/[—–]| - /);
  });
});
