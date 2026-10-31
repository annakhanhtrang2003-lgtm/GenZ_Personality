import { describe, it, expect } from "vitest";
import { shareModel, shareFileName, SHARE_WIDTH, SHARE_HEIGHT } from "../shareImage";
import { careerPathUrl } from "../links";
import { buildProfile } from "../profile";
import { QUESTION_COUNT } from "../likert";
import type { Response } from "../types";

const profile = buildProfile({
  name: "Khanh",
  full_name: "Khanh",
  university: "ueh",
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

  it("is a 4:5 portrait image named after the type", () => {
    expect(SHARE_WIDTH / SHARE_HEIGHT).toBeCloseTo(4 / 5);
    expect(shareFileName(profile.mbti.type)).toBe(`ket-qua-${profile.mbti.type}.png`);
  });
});

describe("careerPathUrl", () => {
  it("opens CareerPath with the top career as the title and the type, nothing personal", () => {
    const url = careerPathUrl("https://jobs.example.com/careerpath", profile);
    const u = new URL(url);
    expect(u.searchParams.get("title")).toBe(profile.synthesis.career_hints[0]);
    expect(u.searchParams.get("mbti")).toBe(profile.mbti.type);
    expect(url).not.toContain("Khanh");
    expect(url).not.toContain("2003");
  });

  it("works with a relative base (inside the team app)", () => {
    const url = careerPathUrl("/careerpath", profile);
    expect(url.startsWith("/careerpath?")).toBe(true);
  });
});
