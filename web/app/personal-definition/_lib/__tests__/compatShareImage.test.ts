import { describe, expect, it } from "vitest";
import { compatCardModel, compatFileName, FORMAT_SIZE } from "../compatShareImage";
import { safeFileName, shareFileName } from "../shareImage";
import { compatResult, type CompatPerson } from "../compat";

type Typed = CompatPerson & { type: string };
const A: Typed = { type: "INFP", sign: "Song Ngư", element: "Water", lifePath: 4 };
const B: Typed = { type: "ENFP", sign: "Cự Giải", element: "Water", lifePath: 8 };
const colors = { accent: "#be185d", tint: "#fdf2f8" };

describe("compat share card", () => {
  it("has story 9:16 and square 1:1 sizes", () => {
    expect(FORMAT_SIZE.story).toEqual({ w: 1080, h: 1920 });
    expect(FORMAT_SIZE.square).toEqual({ w: 1080, h: 1080 });
  });

  it("models total, tier, three ordered bars, the personality match line and a host footer", () => {
    const r = compatResult(A, B);
    const m = compatCardModel(r, A, B, "Khánh", "An", "x.app", colors);
    expect(m.total).toBe(r.total);
    expect(m.tierLabel).toBe(r.tier!.label);
    expect(m.bars).toEqual([
      { label: "Tính cách", score: r.personality!.score },
      { label: "Cung", score: r.zodiac.score },
      { label: "Số Chủ Đạo", score: r.lifePath.score },
    ]);
    expect(m.match).toBe(r.personality!.lines.match);
    expect(m.footer).toContain("x.app");
    expect([m.left, m.right]).toEqual(["Khánh", "An"]);
    expect([m.leftType, m.rightType]).toEqual(["INFP", "ENFP"]);
  });

  it("falls back to 'Bạn ấy' for a missing name", () => {
    const m = compatCardModel(compatResult(A, B), A, B, null, "An", "x.app", colors);
    expect(m.left).toBe("Bạn ấy");
  });

  it("carries no birth date or year", () => {
    const s = JSON.stringify(compatCardModel(compatResult(A, B), A, B, "Khánh", "An", "x.app", colors));
    expect(s).not.toMatch(/(19|20)\d\d/);
  });

  it("names files left-x-right_total.png", () => {
    expect(compatFileName("Khánh", "An", 88)).toBe("Khanh-x-An_88.png");
    expect(compatFileName(null, "An", 71)).toBe("ban-ay-x-An_71.png");
  });

  it("shares one sanitizer with the solo card", () => {
    expect(safeFileName("Đặng Thị  Ánh!")).toBe("Dang-Thi-Anh");
    expect(safeFileName("😀")).toBe("ban");
    expect(safeFileName(null, "ban-ay")).toBe("ban-ay");
    expect(shareFileName("Đặng Thị  Ánh!", "ENTJ", 4)).toBe("Dang-Thi-Anh_ENTJ_4.png");
  });
});
