import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InterludeView } from "../InterludeView";
import { calculateZodiac } from "../../_lib/zodiac";
import { calculateNumerology } from "../../_lib/numerology";
import { PART_HOOKS, RESULT_HOOK } from "../../_lib/interludeCopy";

const extra = { summary: "Bạn nghiêng về Hướng nội (7/10) — sạc pin bằng thời gian một mình.", letters: ["I", null, null, null] };

describe("InterludeView", () => {
  it("says which part was finished", () => {
    render(<InterludeView {...extra} part={0} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByText("Xong phần 1/4 rồi!")).toBeInTheDocument();
  });

  it("names the part coming next", () => {
    render(<InterludeView {...extra} part={0} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByText(/Cách bạn tiếp nhận/)).toBeInTheDocument();
  });

  it("shows the conclusion drawn from the part just finished", () => {
    render(<InterludeView {...extra} part={0} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByTestId("interlude-line")).toHaveTextContent(extra.summary);
  });

  it("fills in the type one letter per part, blanks for the rest", () => {
    render(<InterludeView {...extra} part={1} letters={["I", "N", null, null]} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByTestId("revealed-letters").textContent).toBe("IN__");
    expect(screen.getByTestId("revealed-letters")).toHaveAttribute("aria-label", "Đã biết 2/4 chữ: I, N");
  });

  it("hooks the next part with its question", () => {
    render(<InterludeView {...extra} part={0} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByTestId("next-hook")).toHaveTextContent(PART_HOOKS[1]);
  });

  it("after the last part, hooks the result and its button opens it", () => {
    const onContinue = vi.fn();
    render(<InterludeView {...extra} part={3} letters={["I", "N", "T", "J"]} onContinue={onContinue} onBack={() => {}} />);
    expect(screen.getByTestId("next-hook")).toHaveTextContent("Kết quả của bạn");
    expect(screen.getByTestId("next-hook")).toHaveTextContent(RESULT_HOOK);
    expect(screen.getByText("Mở khoá đầy đủ ở màn kết quả")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xem kết quả" }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("shows a mascot, marked decorative", () => {
    const { container } = render(<InterludeView {...extra} part={2} onContinue={() => {}} onBack={() => {}} />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "");
  });

  it("continues and goes back", () => {
    const onContinue = vi.fn();
    const onBack = vi.fn();
    render(<InterludeView {...extra} part={1} onContinue={onContinue} onBack={onBack} />);
    fireEvent.click(screen.getByRole("button", { name: "Đi tiếp" }));
    fireEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onBack).toHaveBeenCalledOnce();
  });
});

const preview = {
  zodiac: calculateZodiac("2003-10-05"),
  numerology: calculateNumerology("2003-10-05", "Nguyễn Thị Khánh Trang"),
};

describe("InterludeView teaser", () => {
  it("shows nothing extra when no preview is given", () => {
    render(<InterludeView {...extra} part={0} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.queryByTestId("teaser")).not.toBeInTheDocument();
  });

  it("reveals the zodiac sign when a preview is given", () => {
    render(<InterludeView {...extra} part={1} preview={preview} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByTestId("teaser")).toBeInTheDocument();
    expect(screen.getByText(preview.zodiac.sun_sign)).toBeInTheDocument();
  });

  it("reveals the life path number", () => {
    render(<InterludeView {...extra} part={1} preview={preview} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByText(String(preview.numerology.life_path))).toBeInTheDocument();
  });

  it("keeps MBTI locked and names no type", () => {
    render(<InterludeView {...extra} part={1} preview={preview} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByTestId("teaser-locked")).toBeInTheDocument();
    // A halfway type could contradict the final one, so none is computed.
    expect(screen.queryByText(/INFP|INFJ|ENFP|ESTJ/)).not.toBeInTheDocument();
  });

  it("counts the questions still to go", () => {
    render(<InterludeView {...extra} part={1} preview={preview} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByText("Còn 20 câu nữa")).toBeInTheDocument();
  });

  it("still offers the continue button", () => {
    render(<InterludeView {...extra} part={1} preview={preview} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByRole("button", { name: "Đi tiếp" })).toBeInTheDocument();
  });
});

describe("InterludeView colour", () => {
  it("sets the heading and body copy in neutral text, not brand pink", () => {
    render(<InterludeView {...extra} part={1} preview={preview} onContinue={() => {}} onBack={() => {}} />);
    const heading = screen.getByRole("heading", { name: "Xong phần 2/4 rồi!" });
    expect(heading.className).toContain("text-worker-text-primary");
    expect(screen.getByText(/Tiếp theo:/).className).not.toContain("text-worker-primary");
    expect(screen.getByText("Còn 20 câu nữa").className).not.toContain("text-worker-primary");
    expect(screen.getByText(preview.zodiac.traits[0]!).className).not.toContain("text-worker-primary");
  });

  it("keeps pink text to a single small accent: the teaser badges", () => {
    const { container } = render(<InterludeView {...extra} part={1} preview={preview} onContinue={() => {}} onBack={() => {}} />);
    const pink = Array.from(container.querySelectorAll(".text-worker-primary"));
    expect(pink.length).toBeGreaterThan(0);
    for (const el of pink) expect(el).toHaveAttribute("aria-hidden");
  });
});

describe("InterludeView part theme", () => {
  it.each([0, 1, 2, 3])("part %i wears its landing card's colours and full mascot", async (part) => {
    const { PART_THEMES } = await import("../../_lib/partTheme");
    const { srcOf } = await import("../../_lib/mascot");
    const t = PART_THEMES[part]!;
    render(<InterludeView {...extra} part={part} onContinue={() => {}} onBack={() => {}} />);
    const card = screen.getByTestId("interlude-card");
    expect(card).toHaveStyle({ backgroundColor: t.bg });
    expect(card.querySelector("img")).toHaveAttribute("src", srcOf(t.mascot));
    expect(card).toHaveTextContent(`${t.letters[0]} ↔ ${t.letters[1]}`);
  });

  it("sets the conclusion in bold", () => {
    render(<InterludeView {...extra} part={0} onContinue={() => {}} onBack={() => {}} />);
    expect(screen.getByTestId("interlude-line").className).toContain("font-bold");
  });
});
