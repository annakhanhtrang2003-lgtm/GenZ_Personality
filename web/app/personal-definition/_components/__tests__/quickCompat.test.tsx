import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { QuickCompat } from "../compat/QuickCompat";
import { InviteBlock } from "../compat/InviteBlock";
import { compatResult } from "../../_lib/compat";
import { decodeInvite, inviteFromProfile, personFromBirthDate, personFromProfile } from "../../_lib/inviteCode";
import { track } from "../../_lib/analytics";
import { profile } from "./fixtures";

vi.mock("../../_lib/analytics", () => ({ track: vi.fn() }));

const share = vi.fn();
const ALLOWED = new Set(["tier", "format", "hidden_name"]);

beforeEach(() => {
  vi.mocked(track).mockClear();
  share.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", { value: share, configurable: true, writable: true });
});
afterEach(() => {
  Object.defineProperty(navigator, "share", { value: undefined, configurable: true, writable: true });
});

function pick(day: string, month: string, year: string) {
  fireEvent.change(screen.getByLabelText("Ngày"), { target: { value: day } });
  fireEvent.change(screen.getByLabelText("Tháng"), { target: { value: month } });
  fireEvent.change(screen.getByLabelText("Năm"), { target: { value: year } });
}

describe("QuickCompat", () => {
  it("shows the zodiac and life path bars and the range for the friend's date", () => {
    render(<QuickCompat me={profile} accent="#be185d" />);
    const xem = screen.getByRole("button", { name: "Xem nhanh" });
    expect(xem).toBeDisabled();
    pick("14", "7", "2003");
    fireEvent.click(xem);
    const r = compatResult(personFromProfile(profile), personFromBirthDate("2003-07-14"));
    expect(screen.getByRole("progressbar", { name: "Cung" })).toHaveAttribute("aria-valuenow", String(r.zodiac.score));
    expect(screen.getByRole("progressbar", { name: "Số Chủ Đạo" })).toHaveAttribute("aria-valuenow", String(r.lifePath.score));
    expect(screen.getByText(`Điểm tổng của hai đứa sẽ nằm trong khoảng ${r.range.min}–${r.range.max}`)).toBeInTheDocument();
    expect(screen.getByText("Đây mới là 60% thôi, rủ bạn ấy làm test để xem đủ nha")).toBeInTheDocument();
  });

  it("invites with MY code only: no friend name, no friend date, URL bar untouched", async () => {
    const before = window.location.href;
    render(<QuickCompat me={profile} accent="#be185d" />);
    fireEvent.change(screen.getByPlaceholderText("Tên bạn ấy (không bắt buộc)"), { target: { value: "Bảo" } });
    pick("14", "7", "2003");
    fireEvent.click(screen.getByRole("button", { name: "Xem nhanh" }));
    expect(screen.getByText("Đây mới là 60% thôi, rủ Bảo làm test để xem đủ nha")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Gửi link mời cho Bảo" }));
    });
    const { url, text } = share.mock.calls[0]![0] as { url: string; text: string };
    expect(decodeInvite(new URL(url).searchParams.get("i"))).toEqual(inviteFromProfile(profile));
    expect(url + text).not.toContain("B%E1%BA%A3o");
    expect(url + text).not.toContain("Bảo");
    expect(url).not.toContain("2003");
    expect(window.location.href).toBe(before);
  });

  it("never sends analytics props beyond tier/format/hidden_name", async () => {
    render(<QuickCompat me={profile} accent="#be185d" />);
    fireEvent.change(screen.getByPlaceholderText("Tên bạn ấy (không bắt buộc)"), { target: { value: "Bảo" } });
    pick("14", "7", "2003");
    fireEvent.click(screen.getByRole("button", { name: "Xem nhanh" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Gửi link mời cho Bảo" }));
    });
    expect(track).toHaveBeenCalled();
    for (const call of vi.mocked(track).mock.calls) {
      for (const k of Object.keys(call[1] ?? {})) expect(ALLOWED.has(k)).toBe(true);
    }
  });
});

describe("InviteBlock quick toggle", () => {
  it("opens quick mode inline, and can be turned off", () => {
    const { unmount } = render(<InviteBlock profile={profile} accent="#be185d" />);
    fireEvent.click(screen.getByRole("button", { name: "Hoặc thử nhanh với ngày sinh của bạn bè" }));
    expect(screen.getByRole("button", { name: "Xem nhanh" })).toBeInTheDocument();
    unmount();
    render(<InviteBlock profile={profile} accent="#be185d" showQuick={false} />);
    expect(screen.queryByRole("button", { name: "Hoặc thử nhanh với ngày sinh của bạn bè" })).toBeNull();
  });
});

describe("OG image module", () => {
  it("exports alt, size and contentType", async () => {
    const og = await import("../../hop-nhau/opengraph-image");
    expect(og.alt).toBe("Hai đứa hợp nhau tới đâu? 💞");
    expect(og.size).toEqual({ width: 1200, height: 630 });
    expect(og.contentType).toBe("image/png");
  });
});
