import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizItem } from "../QuizItem";

const base = {
  index: 13,
  text: "Khi nhận đề tài mới, tôi muốn xem một ví dụ cụ thể trước đã.",
  value: null,
  isCurrent: false,
  onAnswer: () => {},
};

describe("QuizItem", () => {
  it("numbers the row within its part, not across the bank", () => {
    render(<QuizItem {...base} />);
    // index 13 is the 4th item of part 2
    expect(screen.getByText("4.")).toBeInTheDocument();
  });

  it("always shows the full question and its scale — nothing is collapsed", () => {
    const { rerender } = render(<QuizItem {...base} />);
    expect(screen.getByText(base.text)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    rerender(<QuizItem {...base} isCurrent value={1} />);
    expect(screen.getByText(base.text)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("has no accordion toggle any more", () => {
    render(<QuizItem {...base} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("gives the row a stable id so the part can scroll to it", () => {
    const { container } = render(<QuizItem {...base} />);
    expect(container.querySelector(`#quiz-row-${base.index}`)).not.toBeNull();
  });

  it("marks an answered row", () => {
    render(<QuizItem {...base} value={2} />);
    expect(screen.getByTestId("row-answered")).toBeInTheDocument();
  });

  it("leaves an unanswered row unmarked", () => {
    render(<QuizItem {...base} />);
    expect(screen.queryByTestId("row-answered")).not.toBeInTheDocument();
  });

  it("passes the label set that matches the item", () => {
    // index 13 is sn_02, label_set "situation"
    render(<QuizItem {...base} value={2} />);
    expect(screen.getByTestId("likert-chosen")).toHaveTextContent("Chuẩn luôn");
  });

  it("reports the chosen value and whether a pointer drove it", () => {
    const onAnswer = vi.fn();
    render(<QuizItem {...base} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("radio", { name: "Chuẩn luôn" }), { detail: 1 });
    expect(onAnswer).toHaveBeenCalledWith(2, true);
  });
});

describe("QuizItem emphasis", () => {
  it("sets every question in bold black, not pink", () => {
    render(<QuizItem index={0} text="Câu mẫu" value={null} isCurrent={false} onAnswer={() => {}} />);
    const q = screen.getByText("Câu mẫu");
    expect(q.className).toContain("text-worker-text-primary");
    expect(q.className).toContain("font-semibold");
    expect(q.className).not.toContain("text-worker-primary");
  });

  it("dims an answered row once you move on, so the current one stands out", () => {
    const { container, rerender } = render(<QuizItem index={0} text="Câu mẫu" value={1} isCurrent={false} onAnswer={() => {}} />);
    expect(container.firstElementChild).toHaveAttribute("data-dimmed", "true");
    rerender(<QuizItem index={0} text="Câu mẫu" value={1} isCurrent onAnswer={() => {}} />);
    expect(container.firstElementChild).toHaveAttribute("data-dimmed", "false");
    rerender(<QuizItem index={0} text="Câu mẫu" value={null} isCurrent={false} onAnswer={() => {}} />);
    expect(container.firstElementChild).toHaveAttribute("data-dimmed", "false");
  });
});
