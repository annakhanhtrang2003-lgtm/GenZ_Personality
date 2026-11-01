import { describe, it, expect } from "vitest";
import { shareModel, shareFileName, SHARE_WIDTH, SHARE_HEIGHT } from "../shareImage";
import { buildProfile } from "../profile";
import { QUESTION_COUNT } from "../likert";
import type { Response } from "../types";

const profile = buildProfile({
  name: "Khanh",
  full_name: "Khanh",
  birth_date: "2003-03-14",
  responses: Array.from({ length: QUESTION_COUNT }, (_, i) => ((i % 5) - 2) as Response),
});

describe("shareModel", () => {
  it("carries the type, nickname, display name and temperament", () => {
    const m = shareModel(profile, "personality-test-virid.vercel.app");
    expect(m.type).toBe(profile.mbti.type);
    expect(m.label).toBe(profile.mbti.label);
    expect(m.name).toBe("Khanh");
    expect(m.temperamentName.length).toBeGreaterThan(0);
    expect(m.accent).toMatch(/^#/);
  });

  it("has four bars whose winner matches the type letter", () => {
    const m = shareModel(profile, "x");
    expect(m.bars).toHaveLength(4);
    m.bars.forEach((b, i) => {
      expect(b.winnerPole).toBe(profile.mbti.type[i]);
      expect(b.markerPct).toBeGreaterThanOrEqual(0);
      expect(b.markerPct).toBeLessThanOrEqual(100);
    });
  });

  it("never puts the birth date on the image", () => {
    const m = shareModel(profile, "x");
    expect(JSON.stringify(m)).not.toContain("2003");
  });

  it("points the footer at the test's own host", () => {
    expect(shareModel(profile, "personality-test-virid.vercel.app").footer).toContain("personality-test-virid.vercel.app");
  });

  it("is a 4:5 portrait image", () => {
    expect(SHARE_WIDTH / SHARE_HEIGHT).toBeCloseTo(4 / 5);
  });

  it("names the file name_mbti_number, accents and spaces made file-safe", () => {
    expect(shareFileName("Khanh", "ENTJ", 4)).toBe("Khanh_ENTJ_4.png");
    expect(shareFileName("Trần Khánh Đăng", "INFP", 11)).toBe("Tran-Khanh-Dang_INFP_11.png");
    expect(shareFileName("  ✨ 88 / ok ", "ESTJ", 7)).toBe("88-ok_ESTJ_7.png");
    expect(shareFileName("✨✨", "ESTJ", 7)).toBe("ban_ESTJ_7.png");
  });
});
