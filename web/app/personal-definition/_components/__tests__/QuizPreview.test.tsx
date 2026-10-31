import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QuizPreview, PREVIEW_ID } from "../onboarding/QuizPreview";
import { PART_THEMES } from "../../_lib/partTheme";

// jsdom has no PointerEvent, so fireEvent.pointerDown would drop clientX.
if (typeof window.PointerEvent === "undefined") {
  (window as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = MouseEvent;
}

describe("QuizPreview", () => {
  it("renders one card per part with its letter pair and question range", () => {
    render(<QuizPreview onStart={() => {}} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(within(cards[0]!).getByText("Phần 1 · Câu 1–10")).toBeInTheDocument();
    expect(within(cards[0]!).getByText("E")).toBeInTheDocument();
    expect(within(cards[3]!).getByText("Phần 4 · Câu 31–40")).toBeInTheDocument();
    expect(within(cards[3]!).getByText("P")).toBeInTheDocument();
  });

  it("is the scroll target of the hero CTA", () => {
    const { container } = render(<QuizPreview onStart={() => {}} />);
    expect(container.querySelector(`#${PREVIEW_ID}`)).not.toBeNull();
  });

  it("calls onStart from 'Làm bài test ngay'", () => {
    const onStart = vi.fn();
    render(<QuizPreview onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: "Làm bài test ngay" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  // Review Focus 4 — keyboard users and missing Element.scrollTo.
  it("has a focusable track and labelled dots that track the current card", () => {
    render(<QuizPreview onStart={() => {}} />);
    expect(screen.getByRole("list", { name: /4 phần của bài test/ })).toHaveAttribute("tabindex", "0");
    const dots = screen.getAllByRole("button", { name: /^Phần \d$/ });
    expect(dots).toHaveLength(4);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(() => fireEvent.click(dots[2]!)).not.toThrow();
    expect(dots[2]).toHaveAttribute("aria-current", "true");
    expect(dots[0]).toHaveAttribute("aria-current", "false");
  });

  it("has one card per PART_THEMES entry", () => {
    render(<QuizPreview onStart={() => {}} />);
    expect(screen.getAllByRole("article")).toHaveLength(PART_THEMES.length);
  });

  it("starts the test from any card, by tap or by keyboard", () => {
    const onStart = vi.fn();
    render(<QuizPreview onStart={onStart} />);
    const cards = screen.getAllByRole("article");
    cards.forEach((card) => {
      const btn = within(card).getByRole("button");
      expect(btn.className).toContain("cursor-pointer");
      fireEvent.click(btn, { detail: 1, clientX: 50 });
    });
    // Keyboard Enter on a native button fires click with detail 0.
    fireEvent.click(within(cards[2]!).getByRole("button"), { detail: 0 });
    expect(onStart).toHaveBeenCalledTimes(cards.length + 1);
  });

  it("names each card button after its title", () => {
    render(<QuizPreview onStart={() => {}} />);
    expect(screen.getByRole("button", { name: /Sóng não cực mạnh/ })).toBeInTheDocument();
  });

  it("ignores the click that ends a swipe", () => {
    const onStart = vi.fn();
    render(<QuizPreview onStart={onStart} />);
    const track = screen.getByRole("list", { name: /4 phần của bài test/ });
    const btn = within(screen.getAllByRole("article")[0]!).getByRole("button");
    fireEvent.pointerDown(track, { clientX: 200, clientY: 100 });
    fireEvent.click(btn, { detail: 1, clientX: 120, clientY: 100 });
    expect(onStart).not.toHaveBeenCalled();
    // ...and one where the track itself moved under a still finger.
    fireEvent.pointerDown(track, { clientX: 200, clientY: 100 });
    track.scrollLeft = 60;
    fireEvent.click(btn, { detail: 1, clientX: 200, clientY: 100 });
    expect(onStart).not.toHaveBeenCalled();
    // A plain tap still works.
    fireEvent.pointerDown(track, { clientX: 200, clientY: 100 });
    fireEvent.click(btn, { detail: 1, clientX: 203, clientY: 101 });
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("sizes cards so ~2.5 show on mobile and all 4 from md up", () => {
    render(<QuizPreview onStart={() => {}} />);
    const items = screen.getByRole("list", { name: /4 phần của bài test/ }).querySelectorAll("li");
    for (const li of items) {
      expect(li.className).toContain("flex-[0_0_40%]");
      expect(li.className).toContain("md:flex-[0_0_calc((100%-36px)/4)]");
    }
  });

  it("disables dot transitions under prefers-reduced-motion", () => {
    render(<QuizPreview onStart={() => {}} />);
    const dots = screen.getAllByRole("button", { name: /^Phần [0-9]$/ });
    expect(dots.length).toBeGreaterThan(0);
    for (const dot of dots) {
      expect(dot.querySelector("span")!.className).toContain("motion-reduce:transition-none");
    }
  });
});
