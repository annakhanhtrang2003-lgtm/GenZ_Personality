import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QuizPart } from "../QuizPart";
import { QUESTION_COUNT } from "../../_lib/likert";
import { firstIndexOfPart } from "../../_lib/parts";
import type { Response } from "../../_lib/types";
import { PART_THEMES } from "../../_lib/partTheme";
import { srcOf } from "../../_lib/mascot";

/** Responses with the given part-local positions of `part` answered. */
function responsesFor(part: number, answeredWithin: number[]): (Response | null)[] {
  const r: (Response | null)[] = Array.from({ length: QUESTION_COUNT }, () => null);
  for (const within of answeredWithin) r[firstIndexOfPart(part) + within] = 1;
  return r;
}

const base = {
  part: 1,
  responses: responsesFor(1, []),
  open: null,
  onAnswer: () => {},
  onFinishPart: () => {},
  onBack: () => {},
};

const ALL_TEN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** The radios of one row, by part-local position. */
const rowRadios = (part: number, within_: number) =>
  within(document.getElementById(`quiz-row-${firstIndexOfPart(part) + within_}`)!).getAllByRole("radio");

describe("QuizPart", () => {
  it("names the part and its position", () => {
    render(<QuizPart {...base} />);
    expect(screen.getByText("Phần 2/4")).toBeInTheDocument();
    expect(screen.getByText("Cách bạn tiếp nhận")).toBeInTheDocument();
  });

  it("renders all ten questions with their scales at once", () => {
    render(<QuizPart {...base} />);
    expect(screen.getAllByRole("radio")).toHaveLength(50);
    expect(screen.queryAllByRole("button", { expanded: false })).toHaveLength(0);
  });

  it("fills the bar by answers given, not by row position", () => {
    render(<QuizPart {...base} responses={responsesFor(1, [0, 1, 2])} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "30");
    expect(screen.getByText("3/10 câu")).toBeInTheDocument();
  });

  it("marks only the current row as current", () => {
    const { container } = render(<QuizPart {...base} open={firstIndexOfPart(1) + 2} />);
    expect(container.querySelectorAll('[data-current="true"]')).toHaveLength(1);
    expect(container.querySelector('[data-current="true"]')).toHaveAttribute("id", `quiz-row-${firstIndexOfPart(1) + 2}`);
  });

  it("keeps the end-of-part button disabled until all ten are answered", () => {
    const { rerender } = render(<QuizPart {...base} responses={responsesFor(1, [0, 1, 2])} />);
    expect(screen.getByRole("button", { name: "Xong phần 2" })).toBeDisabled();
    rerender(<QuizPart {...base} responses={responsesFor(1, ALL_TEN)} />);
    expect(screen.getByRole("button", { name: "Xong phần 2" })).toBeEnabled();
  });

  it("ends the last part like the others — the result button lives on its summary screen", () => {
    render(<QuizPart {...base} part={3} responses={responsesFor(3, ALL_TEN)} />);
    expect(screen.getByRole("button", { name: "Xong phần 4" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xem kết quả" })).not.toBeInTheDocument();
  });

  it("hides the back button on the first part", () => {
    render(<QuizPart {...base} part={0} responses={responsesFor(0, [])} />);
    expect(screen.queryByRole("button", { name: "Quay lại" })).not.toBeInTheDocument();
  });

  it("reports which row was answered, by absolute index, and that a pointer drove it", () => {
    const onAnswer = vi.fn();
    render(<QuizPart {...base} open={firstIndexOfPart(1)} onAnswer={onAnswer} />);
    fireEvent.click(rowRadios(1, 3)[0]!, { detail: 1 });
    expect(onAnswer).toHaveBeenCalledWith(firstIndexOfPart(1) + 3, 2, true);
  });

  it("reports advance:false for a keyboard-driven answer", () => {
    const onAnswer = vi.fn();
    render(<QuizPart {...base} open={firstIndexOfPart(1)} onAnswer={onAnswer} />);
    fireEvent.click(rowRadios(1, 0)[0]!); // detail 0 — keyboard/programmatic
    expect(onAnswer).toHaveBeenCalledWith(firstIndexOfPart(1), 2, false);
  });

  it("scrolls the next question into view after a tap, smoothly", () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const open = firstIndexOfPart(1);
    const { rerender } = render(<QuizPart {...base} open={open} />);
    fireEvent.click(rowRadios(1, 0)[0]!, { detail: 1 }); // pointer
    rerender(<QuizPart {...base} open={open + 1} responses={responsesFor(1, [0])} />);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toHaveAttribute("id", `quiz-row-${open + 1}`);
    expect(scroll.mock.calls[0]![0]).toMatchObject({ block: "center", behavior: "smooth" });
  });

  it("scrolls to the end-of-part button once the last question is answered", () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const last = firstIndexOfPart(1) + 9;
    const { rerender } = render(<QuizPart {...base} open={last} responses={responsesFor(1, [0, 1, 2, 3, 4, 5, 6, 7, 8])} />);
    fireEvent.click(rowRadios(1, 9)[0]!, { detail: 1 });
    rerender(<QuizPart {...base} open={null} responses={responsesFor(1, ALL_TEN)} />);
    expect(scroll.mock.contexts[0]).toHaveTextContent("Xong phần 2");
  });

  it("does not scroll on keyboard answers — the person is moving with Tab/arrows", () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const open = firstIndexOfPart(1);
    const { rerender } = render(<QuizPart {...base} open={open} />);
    fireEvent.click(rowRadios(1, 0)[0]!); // keyboard, advance:false
    rerender(<QuizPart {...base} open={open} responses={responsesFor(1, [0])} />);
    expect(scroll).not.toHaveBeenCalled();
  });

  it("does not steal focus when it scrolls", () => {
    Element.prototype.scrollIntoView = vi.fn();
    const open = firstIndexOfPart(1);
    const { rerender } = render(<QuizPart {...base} open={open} />);
    const radio = rowRadios(1, 0)[0]!;
    radio.focus();
    fireEvent.click(radio, { detail: 1 });
    rerender(<QuizPart {...base} open={open + 1} responses={responsesFor(1, [0])} />);
    expect(document.activeElement).toBe(radio);
  });

  it("shows the part's dimension mascot", () => {
    const { container } = render(<QuizPart {...base} />);
    expect(container.querySelector("img")).toHaveAttribute("src", srcOf(PART_THEMES[1]!.mascot));
  });

  it("remounts the mascot on each new answer so the pulse replays", () => {
    const { container, rerender } = render(<QuizPart {...base} />);
    const before = container.querySelector("img");
    rerender(<QuizPart {...base} responses={responsesFor(1, [0])} />);
    expect(container.querySelector("img")).not.toBe(before);
  });

  it("shows the part's letter pair", () => {
    const { rerender } = render(<QuizPart {...base} part={0} responses={responsesFor(0, [])} />);
    expect(screen.getByTestId("part-letters")).toHaveTextContent("E · I");
    rerender(<QuizPart {...base} part={3} responses={responsesFor(3, [])} />);
    expect(screen.getByTestId("part-letters")).toHaveTextContent("J · P");
  });

  it("marks the mascot face as decorative", () => {
    const { container } = render(<QuizPart {...base} />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
