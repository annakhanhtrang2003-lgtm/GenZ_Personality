import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HopNhauScreen } from "../compat/HopNhauScreen";
import { encodeInvite, personFromBirthDate, personFromInvite, type InvitePayload } from "../../_lib/inviteCode";
import { compatResult } from "../../_lib/compat";
import { track } from "../../_lib/analytics";

let params = new URLSearchParams();
vi.mock("next/navigation", () => ({ useSearchParams: () => params }));
vi.mock("../../_lib/analytics", () => ({ track: vi.fn() }));

const A: InvitePayload = { v: 1, type: "INFP", sign: 11, lifePath: 4 }; // Song Ngư
const CODE = encodeInvite(A);
const DATE = "2003-07-14";

function open(query: string, hash = "") {
  params = new URLSearchParams(query);
  window.history.replaceState(null, "", `/personal-definition/hop-nhau${query ? `?${query}` : ""}${hash}`);
  return render(<HopNhauScreen />);
}

function pickDate() {
  fireEvent.change(screen.getByLabelText("Ngày"), { target: { value: "14" } });
  fireEvent.change(screen.getByLabelText("Tháng"), { target: { value: "7" } });
  fireEvent.change(screen.getByLabelText("Năm"), { target: { value: "2003" } });
}

const expected = () => compatResult(personFromInvite(A), personFromBirthDate(DATE));

beforeEach(() => {
  vi.mocked(track).mockClear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => window.history.replaceState(null, "", "/"));

describe("B1 landing", () => {
  it("greets with the inviter's name and facts, and fires invite_open once", () => {
    open(`i=${CODE}`, "#n=Kh%C3%A1nh");
    expect(screen.getByRole("heading", { name: "Khánh mời bạn xem hai đứa hợp nhau tới đâu" })).toBeInTheDocument();
    const sub = screen.getByTestId("inviter-facts").textContent ?? "";
    expect(sub).toContain("Nhóm Lý Tưởng");
    expect(sub).toContain("Song Ngư");
    expect(sub).toContain("Số Chủ Đạo 4");
    expect(vi.mocked(track).mock.calls.filter(([e]) => e === "compat_invite_open")).toHaveLength(1);
  });

  it("falls back to 'Một người bạn' without a name", () => {
    open(`i=${CODE}`);
    expect(screen.getByRole("heading", { name: "Một người bạn mời bạn xem hai đứa hợp nhau tới đâu" })).toBeInTheDocument();
  });

  it.each([["31 chars", `#n=${"a".repeat(31)}`], ["bad escape", "#n=%E0%A4%A"]])(
    "falls back to 'Một người bạn' for a %s name",
    (_l, hash) => {
      open(`i=${CODE}`, hash);
      expect(screen.getByRole("heading", { name: /^Một người bạn mời bạn/ })).toBeInTheDocument();
    },
  );

  it("keeps 'Xem độ hợp ngay' disabled until a full date is picked", () => {
    open(`i=${CODE}`);
    const btn = screen.getByRole("button", { name: "Xem độ hợp ngay" });
    expect(btn).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Ngày"), { target: { value: "14" } });
    expect(btn).toBeDisabled();
    pickDate();
    expect(btn).toBeEnabled();
  });
});

describe("B2 partial", () => {
  function toPartial() {
    open(`i=${CODE}`, "#n=Kh%C3%A1nh");
    const before = window.location.href;
    pickDate();
    fireEvent.click(screen.getByRole("button", { name: "Xem độ hợp ngay" }));
    return before;
  }

  it("shows the zodiac and life path bars, locked row and range", () => {
    toPartial();
    const r = expected();
    expect(screen.getByRole("progressbar", { name: "Cung" })).toHaveAttribute("aria-valuenow", String(r.zodiac.score));
    expect(screen.getByRole("progressbar", { name: "Số Chủ Đạo" })).toHaveAttribute("aria-valuenow", String(r.lifePath.score));
    expect(screen.getByText(r.zodiac.lines.match)).toBeInTheDocument();
    expect(screen.getByText(r.lifePath.lines.match)).toBeInTheDocument();
    expect(screen.getByText("Làm 40 câu để mở khóa 40% còn lại")).toBeInTheDocument();
    expect(
      screen.getByText(`Điểm tổng của hai đứa sẽ nằm trong khoảng ${r.range.min}–${r.range.max}`),
    ).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith("compat_partial_view");
  });

  it("never shows the birth date or puts it in the URL", () => {
    const before = toPartial();
    const text = document.body.textContent ?? "";
    expect(text).not.toContain(DATE);
    expect(text).not.toContain("14/07/2003");
    expect(window.location.href).toBe(before);
  });

  it("'Làm test để mở khóa' opens the pre-filled form, and Quay lại returns to B2", () => {
    toPartial();
    fireEvent.click(screen.getByRole("button", { name: "Làm test để mở khóa" }));
    expect(track).toHaveBeenCalledWith("compat_test_start");
    expect((screen.getByLabelText("Ngày") as HTMLSelectElement).value).toBe("14");
    fireEvent.click(screen.getByRole("button", { name: /Quay lại/ }));
    expect(screen.getByRole("progressbar", { name: "Cung" })).toHaveAttribute(
      "aria-valuenow",
      String(expected().zodiac.score),
    );
  });

  it("'Để sau' goes to the test's intro", () => {
    toPartial();
    expect(screen.getByRole("link", { name: "Để sau" })).toHaveAttribute("href", "/personal-definition");
  });
});

describe("B-ERR", () => {
  it.each([
    ["garbage", "i=%%%garbage"],
    ["a truncated code", `i=${CODE.slice(0, -4)}`],
    ["no i", ""],
  ])("shows the friendly error for %s", (_l, query) => {
    open(query);
    expect(screen.getByRole("heading", { name: "Link này hơi lạ á 🤔" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Làm bài test ngay" })).toHaveAttribute("href", "/personal-definition");
    expect(track).not.toHaveBeenCalledWith("compat_invite_open");
  });
});
