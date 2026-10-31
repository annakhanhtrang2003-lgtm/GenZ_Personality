import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QuizPreview, PREVIEW_ID } from "../onboarding/QuizPreview";

/** Fake IntersectionObserver that remembers which element each one watches. */
type Watch = { cb: IntersectionObserverCallback; targets: Element[] };
let watches: Watch[] = [];
class FakeIO {
  private w: Watch;
  constructor(cb: IntersectionObserverCallback) {
    this.w = { cb, targets: [] };
    watches.push(this.w);
  }
  observe(el: Element) {
    this.w.targets.push(el);
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function setVisible(el: Element, isIntersecting: boolean, ratio?: number) {
  act(() => {
    for (const w of watches) {
      if (w.targets.includes(el)) w.cb([{ isIntersecting, intersectionRatio: ratio ?? (isIntersecting ? 1 : 0), target: el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    }
  });
}

const mainCta = () => screen.getAllByRole("button", { name: "Làm bài test ngay" })[0]!;

describe("QuizPreview sticky CTA", () => {
  beforeEach(() => {
    watches = [];
    vi.stubGlobal("IntersectionObserver", FakeIO);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("is hidden while the preview section is not on screen (hero has its own CTA)", () => {
    const { container } = render(<QuizPreview onStart={() => {}} />);
    setVisible(container.querySelector(`#${PREVIEW_ID}`)!, false);
    setVisible(mainCta(), false);
    expect(screen.queryByTestId("sticky-cta")).not.toBeInTheDocument();
  });

  it("appears when the section is on screen but the real CTA is not", () => {
    const { container } = render(<QuizPreview onStart={() => {}} />);
    const cta = mainCta();
    setVisible(cta, false);
    setVisible(container.querySelector(`#${PREVIEW_ID}`)!, true);
    expect(screen.getByTestId("sticky-cta")).toBeInTheDocument();
  });

  it("stays up while only a sliver of the real CTA peeks in at the bottom", () => {
    const { container } = render(<QuizPreview onStart={() => {}} />);
    const cta = mainCta();
    setVisible(container.querySelector(`#${PREVIEW_ID}`)!, true);
    setVisible(cta, true, 0.2);
    expect(screen.getByTestId("sticky-cta")).toBeInTheDocument();
  });

  it("goes away once the real CTA scrolls into view, so it never covers the page end", () => {
    const { container } = render(<QuizPreview onStart={() => {}} />);
    const cta = mainCta();
    setVisible(container.querySelector(`#${PREVIEW_ID}`)!, true);
    setVisible(cta, false);
    expect(screen.getByTestId("sticky-cta")).toBeInTheDocument();
    setVisible(cta, true);
    expect(screen.queryByTestId("sticky-cta")).not.toBeInTheDocument();
  });

  it("starts the test, is mobile-only and clears the iPhone home indicator", () => {
    const onStart = vi.fn();
    const { container } = render(<QuizPreview onStart={onStart} />);
    setVisible(mainCta(), false);
    setVisible(container.querySelector(`#${PREVIEW_ID}`)!, true);
    const bar = screen.getByTestId("sticky-cta");
    expect(bar.className).toContain("md:hidden");
    expect(bar.className).toContain("env(safe-area-inset-bottom)");
    fireEvent.click(bar.querySelector("button")!);
    expect(onStart).toHaveBeenCalledOnce();
  });
});
