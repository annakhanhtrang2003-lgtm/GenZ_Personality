import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SynthesisView } from "../SynthesisView";
import { dominantPole } from "../../_lib/poles";
import type { Dimension } from "../../_lib/types";
import { profile } from "./fixtures";

const DIMENSIONS: Dimension[] = ["EI", "SN", "TF", "JP"];

describe("SynthesisView", () => {
  it("guards the fixture: four distinct, non-tied percentages, type ESFP", () => {
    const percents = DIMENSIONS.map((d) => dominantPole(d, profile.mbti.dimensions[d]).percent);
    expect(new Set(percents).size).toBe(4);
    expect(percents).not.toContain(50);
    expect(profile.mbti.type).toBe("ESFP");
  });

  it("leads with the sticker card, the type as the page heading, and the Vietnamese label", () => {
    render(<SynthesisView profile={profile} />);
    expect(screen.getByTestId("sticker-card")).toHaveAttribute("data-type", "ESFP");
    expect(screen.getByRole("heading", { level: 1, name: profile.mbti.type })).toBeInTheDocument();
    expect(screen.getByText(profile.mbti.label)).toBeInTheDocument();
  });

  it("shows the user's name without zodiac or life path", () => {
    render(<SynthesisView profile={profile} />);
    expect(screen.getByTestId("result-name")).toHaveTextContent(profile.user.name);
    expect(screen.getByTestId("result-name")).not.toHaveTextContent(profile.zodiac.sun_sign);
  });

  it("renders the narrative including its caveat", () => {
    render(<SynthesisView profile={profile} />);
    expect(screen.getByText(/không phải toàn bộ con người bạn/)).toBeInTheDocument();
  });

  it("renders the four sections in order", () => {
    render(<SynthesisView profile={profile} />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["Bốn chiều của bạn", "Số chủ đạo & cung hoàng đạo", "Điểm mạnh", "Điểm cần cải thiện", "Nghề nghiệp phù hợp"]);
  });

  it("puts the mascot card on the left and life path + zodiac on the right, above the details", () => {
    render(<SynthesisView profile={profile} />);
    const top = screen.getByTestId("result-top");
    const [left, right] = Array.from(top.children);
    expect(left).toContainElement(screen.getByTestId("sticker-card"));
    expect(within(right as HTMLElement).getByTestId("hero-life-path")).toHaveTextContent(String(profile.numerology.life_path));
    expect(within(right as HTMLElement).getByTestId("hero-zodiac")).toHaveTextContent(profile.zodiac.sun_sign);
    // The top row comes before the type heading and every details section.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(top.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("gives the full life path meaning and the zodiac traits in the details", () => {
    render(<SynthesisView profile={profile} />);
    const card = screen.getByTestId("life-path");
    expect(card).toHaveTextContent(profile.numerology.interpretations.life_path);
    for (const t of profile.zodiac.traits) expect(card).toHaveTextContent(t);
  });

  it("shows none of the name-based numbers (the form no longer asks for a legal name)", () => {
    const { container } = render(<SynthesisView profile={profile} />);
    expect(container.textContent ?? "").not.toMatch(/Số Sứ Mệnh|Số Linh Hồn|Số Nhân Cách/);
  });

  it("paints the page in the temperament tint", () => {
    render(<SynthesisView profile={profile} />);
    // ESFP → explorers → #fff7d6
    expect(screen.getByTestId("result-page")).toHaveStyle({ backgroundColor: "#fff7d6" });
  });

  it("renders whatever actions it is given", () => {
    render(<SynthesisView profile={profile} actions={<button>Lưu ảnh</button>} />);
    expect(screen.getByRole("button", { name: "Lưu ảnh" })).toBeInTheDocument();
  });
});
