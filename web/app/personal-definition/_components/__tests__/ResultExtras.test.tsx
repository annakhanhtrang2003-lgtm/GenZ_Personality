import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultExtras } from "../result/ResultExtras";
import { voucherUrl } from "../../_lib/links";

const REWARD = "Chúc mừng bạn đã khám phá bản thân và nhận ngay phần thưởng xịn tại đây";

describe("voucherUrl", () => {
  it("is null until a voucher link is configured", () => {
    expect(voucherUrl("", "REF123")).toBeNull();
  });

  it("adds the refID when there is one", () => {
    expect(voucherUrl("https://momo.vn/voucher", "REF123")).toBe("https://momo.vn/voucher?refId=REF123");
    expect(voucherUrl("https://momo.vn/voucher?a=1", "REF123")).toBe("https://momo.vn/voucher?a=1&refId=REF123");
  });

  it("leaves the link alone when no refID is set yet", () => {
    expect(voucherUrl("https://momo.vn/voucher", "")).toBe("https://momo.vn/voucher");
  });
});

describe("ResultExtras", () => {
  it("links the reward card straight to the voucher", () => {
    render(<ResultExtras accent="#6d28d9" voucherHref="https://momo.vn/voucher?refId=R1" />);
    const link = screen.getByRole("link", { name: new RegExp(REWARD) });
    expect(link).toHaveAttribute("href", "https://momo.vn/voucher?refId=R1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("shows the reward card but says the link is coming when none is set", () => {
    render(<ResultExtras accent="#6d28d9" voucherHref={null} />);
    expect(screen.queryByRole("link", { name: new RegExp(REWARD) })).not.toBeInTheDocument();
    const card = screen.getByTestId("reward-card");
    expect(card).toHaveTextContent(REWARD);
    expect(card).toHaveAttribute("aria-disabled", "true");
    expect(card).toHaveTextContent(/đang được cập nhật/);
  });

  it("teases the personal-year feature as coming soon, not clickable", () => {
    render(<ResultExtras accent="#6d28d9" voucherHref={null} />);
    const teaser = screen.getByTestId("personal-year-teaser");
    expect(teaser).toHaveTextContent("Xác định năm cá nhân của bạn có gì tại đây");
    expect(teaser).toHaveTextContent("Sắp ra mắt");
    expect(teaser.querySelector("a, button")).toBeNull();
  });
});
