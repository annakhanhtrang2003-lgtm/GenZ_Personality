import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CareerSection } from "../result/CareerSection";
import { profile } from "./fixtures";

const ACCENT = "#c2410c";

describe("CareerSection", () => {
  it("shows every career hint as a chip, with the hint-not-verdict footnote", () => {
    render(<CareerSection hints={profile.synthesis.career_hints} accent={ACCENT} />);
    expect(screen.getByRole("heading", { name: "Nghề nghiệp phù hợp" })).toBeInTheDocument();
    for (const h of profile.synthesis.career_hints) {
      expect(screen.getByText(h)).toBeInTheDocument();
    }
    expect(
      screen.getByText("Gợi ý để bạn tìm hiểu thêm, không phải lựa chọn duy nhất."),
    ).toBeInTheDocument();
  });
});
