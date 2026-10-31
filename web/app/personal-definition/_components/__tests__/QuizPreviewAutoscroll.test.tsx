import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QuizPreview, AUTO_START_DELAY } from "../onboarding/QuizPreview";

/** jsdom has no IntersectionObserver; this one lets a test say "now visible". */
let ioCallbacks: IntersectionObserverCallback[] = [];
class FakeIO {
  constructor(cb: IntersectionObserverCallback) {
    ioCallbacks.push(cb);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: reduce && q.includes("reduce"),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
}

/** Collects rAF callbacks so a test can step frames by hand. */
let frames: FrameRequestCallback[] = [];

function renderVisible() {
  render(<QuizPreview onStart={() => {}} />);
  const track = screen.getByRole("list", { name: /4 phần của bài test/ });
  Object.defineProperty(track, "scrollWidth", { configurable: true, value: 1000 });
  Object.defineProperty(track, "clientWidth", { configurable: true, value: 375 });
  act(() => {
    for (const cb of ioCallbacks) cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
  });
  act(() => {
    vi.advanceTimersByTime(AUTO_START_DELAY);
  });
  return track;
}

function step(t: number) {
  const pending = frames;
  frames = [];
  act(() => pending.forEach((f) => f(t)));
}

describe("QuizPreview auto-scroll", () => {
  beforeEach(() => {
    ioCallbacks = [];
    frames = [];
    vi.useFakeTimers();
    vi.stubGlobal("IntersectionObserver", FakeIO);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("drifts the track forward once it is on screen", () => {
    setReducedMotion(false);
    const track = renderVisible();
    step(1000);
    step(2000);
    expect(track.scrollLeft).toBeGreaterThan(0);
  });

  it("never starts under prefers-reduced-motion", () => {
    setReducedMotion(true);
    const track = renderVisible();
    step(1000);
    step(2000);
    expect(frames).toHaveLength(0);
    expect(track.scrollLeft).toBe(0);
  });

  it.each(["pointerDown", "touchStart", "wheel", "keyDown"] as const)("stops for good on %s", (ev) => {
    setReducedMotion(false);
    const track = renderVisible();
    step(1000);
    step(2000);
    fireEvent[ev](track);
    const at = track.scrollLeft;
    step(3000);
    step(4000);
    expect(track.scrollLeft).toBe(at);
  });

  it("stops when a mouse actually moves over it", () => {
    setReducedMotion(false);
    const track = renderVisible();
    step(1000);
    step(2000);
    const move = new MouseEvent("mousemove", { bubbles: true });
    Object.defineProperty(move, "movementX", { value: 4 });
    act(() => {
      track.dispatchEvent(move);
    });
    const at = track.scrollLeft;
    step(3000);
    expect(track.scrollLeft).toBe(at);
  });

  it("keeps going when the page scrolls it under a still cursor", () => {
    setReducedMotion(false);
    const track = renderVisible();
    step(1000);
    act(() => {
      fireEvent.mouseEnter(track);
      track.dispatchEvent(new MouseEvent("mousemove", { bubbles: true })); // movement 0
    });
    const at = track.scrollLeft;
    step(2000);
    expect(track.scrollLeft).toBeGreaterThan(at);
  });

  it("does not snap back on touch; snap returns with the person's own scroll", () => {
    setReducedMotion(false);
    const track = renderVisible();
    step(1000);
    step(2000);
    expect(track.style.scrollSnapType).toBe("none");
    fireEvent.pointerDown(track);
    expect(track.style.scrollSnapType).toBe("none");
    track.scrollLeft += 40;
    fireEvent.scroll(track);
    expect(track.style.scrollSnapType).toBe("");
  });

  it("stops at the last card instead of jumping back to the start", () => {
    setReducedMotion(false);
    const track = renderVisible();
    for (let t = 1000; t < 200_000; t += 1000) step(t);
    expect(track.scrollLeft).toBe(1000 - 375);
    expect(frames).toHaveLength(0);
    expect(track.style.scrollSnapType).toBe("");
  });
});
