import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultExtras } from "../result/ResultExtras";

describe("ResultExtras", () => {
  it("teases the personal-year feature as coming soon, not clickable", () => {
    render(<ResultExtras accent="#6d28d9" />);
    const teaser = screen.getByTestId("personal-year-teaser");
    expect(teaser).toHaveTextContent("Xác định năm cá nhân của bạn có gì tại đây");
    expect(teaser).toHaveTextContent("Sắp ra mắt");
    expect(teaser.querySelector("a, button")).toBeNull();
  });

  it("has no reward/voucher card any more", () => {
    const { container } = render(<ResultExtras accent="#6d28d9" />);
    expect(screen.queryByTestId("reward-card")).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/phần thưởng/);
  });
});
