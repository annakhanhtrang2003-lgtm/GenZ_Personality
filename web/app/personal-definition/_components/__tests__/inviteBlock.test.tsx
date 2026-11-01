import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { InviteBlock } from "../compat/InviteBlock";
import { PersonalDefinitionFlow } from "../PersonalDefinitionFlow";
import { decodeInvite, encodeInvite, inviteFromProfile } from "../../_lib/inviteCode";
import { track } from "../../_lib/analytics";
import { PART_COUNT, PART_SIZE, firstIndexOfPart } from "../../_lib/parts";
import { profile } from "./fixtures";

// Full 40-question jsdom flows run long when the machine is busy.
const FULL_FLOW_MS = 20_000;
vi.mock("../../_lib/analytics", () => ({ track: vi.fn() }));

const share = vi.fn();
const writeText = vi.fn();

function setShare(fn: typeof share | undefined) {
  Object.defineProperty(navigator, "share", { value: fn, configurable: true, writable: true });
}
function setClipboard(fn: typeof writeText | undefined) {
  Object.defineProperty(navigator, "clipboard", { value: fn ? { writeText: fn } : undefined, configurable: true });
}
const codeOf = (url: string) => new URL(url).searchParams.get("i");

beforeEach(() => {
  vi.mocked(track).mockClear();
  share.mockReset().mockResolvedValue(undefined);
  writeText.mockReset().mockResolvedValue(undefined);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.matchMedia = undefined as unknown as typeof window.matchMedia;
});
afterEach(() => {
  setShare(undefined);
  setClipboard(undefined);
});

async function clickInvite(name = "Xem bạn hợp với ai 💞") {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

describe("InviteBlock", () => {
  it("shares an invite URL that decodes to the profile and leaks no date", async () => {
    setShare(share);
    render(<InviteBlock profile={profile} accent="#be185d" />);
    await clickInvite();
    const { url, text } = share.mock.calls[0]![0] as { url: string; text: string };
    expect(url).toMatch(/\/personal-definition\/hop-nhau\?i=[A-Za-z0-9_-]+#n=/);
    expect(decodeInvite(codeOf(url))).toEqual(inviteFromProfile(profile));
    expect(url).not.toContain(profile.user.birth_date);
    expect(url).not.toContain(profile.user.birth_date.slice(0, 4));
    expect(text).toMatch(/^Mình là .+ nè, vô xem hai đứa hợp nhau tới đâu 💞$/);
    expect(track).toHaveBeenCalledWith("compat_invite_create", { hidden_name: false });
  });

  it("hides the name when asked", async () => {
    setShare(share);
    render(<InviteBlock profile={profile} accent="#be185d" />);
    fireEvent.click(screen.getByLabelText("Ẩn tên của mình trong link"));
    await clickInvite();
    expect((share.mock.calls[0]![0] as { url: string }).url).not.toContain("#");
    expect(track).toHaveBeenCalledWith("compat_invite_create", { hidden_name: true });
  });

  it("copies the link when there is no Web Share", async () => {
    setShare(undefined);
    setClipboard(writeText);
    render(<InviteBlock profile={profile} accent="#be185d" />);
    await clickInvite();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Đã copy link, dán cho bạn bè nha!");
  });

  it("shows the link in a read-only box when the clipboard is blocked", async () => {
    setShare(undefined);
    setClipboard(writeText.mockRejectedValue(new Error("denied")));
    render(<InviteBlock profile={profile} accent="#be185d" />);
    await clickInvite();
    const box = within(screen.getByRole("status")).getByRole("textbox") as HTMLInputElement;
    expect(box.readOnly).toBe(true);
    expect(box.value).toMatch(/hop-nhau\?i=/);
    expect(screen.getByText("Bấm giữ để copy link")).toBeInTheDocument();
    expect(track).not.toHaveBeenCalled();
  });

  it("stays quiet when the share sheet is cancelled", async () => {
    setShare(share.mockRejectedValue(new DOMException("x", "AbortError")));
    render(<InviteBlock profile={profile} accent="#be185d" />);
    await clickInvite();
    expect(screen.getByRole("status")).toHaveTextContent("");
    expect(track).not.toHaveBeenCalled();
  });
});

function finishQuiz() {
  fireEvent.click(screen.getByRole("button", { name: /^bắt đầu$/i }));
  for (let part = 0; part < PART_COUNT; part++) {
    for (let row = 0; row < PART_SIZE; row++) {
      const rowEl = document.getElementById(`quiz-row-${firstIndexOfPart(part) + row}`)!;
      fireEvent.click(within(rowEl).getAllByRole("radio")[0]!, { detail: 1 });
    }
    fireEvent.click(screen.getByRole("button", { name: `Xong phần ${part + 1}` }));
    fireEvent.click(screen.getByRole("button", { name: part === PART_COUNT - 1 ? "Xem kết quả" : "Đi tiếp" }));
  }
}

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText(/tên bạn muốn hiển thị/i), { target: { value: "An" } });
  fireEvent.change(screen.getByLabelText("Trường của bạn"), { target: { value: "ueh" } });
}

describe("flow wiring", () => {
  it("A's own result offers the invite button", () => {
    render(<PersonalDefinitionFlow />);
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu hành trình của bạn" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Làm bài test ngay" })[0]!);
    fillForm();
    fireEvent.change(screen.getByLabelText("Ngày"), { target: { value: "14" } });
    fireEvent.change(screen.getByLabelText("Tháng"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText("Năm"), { target: { value: "2003" } });
    finishQuiz();
    expect(screen.getByRole("button", { name: "Xem bạn hợp với ai 💞" })).toBeInTheDocument();
  }, FULL_FLOW_MS);

  it("B's compare sends a pair link back to A and invites others with B's code", async () => {
    setShare(share);
    const codeA = encodeInvite({ v: 1, type: "INFP", sign: 11, lifePath: 4 });
    render(
      <PersonalDefinitionFlow
        invite={{ person: { type: "INFP", sign: "Song Ngư", element: "Water", lifePath: 4 }, code: codeA, name: "Khánh" }}
        initialBirthDate="2003-07-14"
      />,
    );
    fillForm();
    finishQuiz();
    const myType = screen.getByRole("heading", { level: 1 }).textContent;

    await clickInvite("Gửi kết quả cho Khánh");
    const back = (share.mock.calls[0]![0] as { url: string }).url;
    expect(back).toContain(`?i=${codeA}&j=`);
    expect(back).toContain("#n=Kh%C3%A1nh");
    expect(back).not.toContain("2003");

    await clickInvite("Mời người khác");
    const other = (share.mock.calls[1]![0] as { url: string }).url;
    expect(decodeInvite(codeOf(other))?.type).toBe(myType);
  }, FULL_FLOW_MS);
});
