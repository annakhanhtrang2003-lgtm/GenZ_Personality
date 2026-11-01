import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CompatView } from "../compat/CompatView";
import { HopNhauScreen } from "../compat/HopNhauScreen";
import { PersonalDefinitionFlow } from "../PersonalDefinitionFlow";
import { compatResult, type CompatPerson } from "../../_lib/compat";
import { encodeInvite } from "../../_lib/inviteCode";
import { track } from "../../_lib/analytics";
import { act } from "@testing-library/react";
import { compatFileName } from "../../_lib/compatShareImage";
import { PART_COUNT, PART_SIZE, firstIndexOfPart } from "../../_lib/parts";

let params = new URLSearchParams();
vi.mock("next/navigation", () => ({ useSearchParams: () => params }));
vi.mock("../../_lib/analytics", () => ({ track: vi.fn() }));
vi.mock("../../_lib/compatShareImage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../_lib/compatShareImage")>()),
  renderCompatImage: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
}));

type Typed = CompatPerson & { type: string };
const A: Typed = { type: "INFP", sign: "Song Ngư", element: "Water", lifePath: 4 };
const B: Typed = { type: "ENFP", sign: "Cự Giải", element: "Water", lifePath: 8 };

function reduceMotion(on: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: on && q.includes("reduce"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  vi.mocked(track).mockClear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  reduceMotion(true);
});

describe("CompatView", () => {
  it("headers: viewer-is-b with and without A's name, and pair mode", () => {
    const { unmount } = render(<CompatView a={A} b={B} nameA="Khánh" nameB={null} mode="viewer-is-b" />);
    expect(screen.getByRole("heading", { name: "Bạn × Khánh" })).toBeInTheDocument();
    unmount();
    const r2 = render(<CompatView a={A} b={B} nameA={null} nameB={null} mode="viewer-is-b" />);
    expect(screen.getByRole("heading", { name: "Bạn × bạn ấy" })).toBeInTheDocument();
    r2.unmount();
    render(<CompatView a={A} b={B} nameA="Khánh" nameB="An" mode="pair" />);
    expect(screen.getByRole("heading", { name: "Khánh × An" })).toBeInTheDocument();
  });

  it("shows total, tier, three bars, factor lines and activities", () => {
    const r = compatResult(A, B);
    render(<CompatView a={A} b={B} nameA="Khánh" nameB={null} mode="viewer-is-b" />);
    expect(screen.getByTestId("compat-total")).toHaveTextContent(String(r.total));
    expect(screen.getByText(r.tier!.label)).toBeInTheDocument();
    expect(screen.getByText(r.tier!.line)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Tính cách" })).toHaveAttribute("aria-valuenow", String(r.personality!.score));
    expect(screen.getByRole("progressbar", { name: "Cung" })).toHaveAttribute("aria-valuenow", String(r.zodiac.score));
    expect(screen.getByRole("progressbar", { name: "Số Chủ Đạo" })).toHaveAttribute("aria-valuenow", String(r.lifePath.score));
    for (const line of [r.personality!.lines, r.zodiac.lines, r.lifePath.lines].flatMap((l) => [l.match, l.clash])) {
      expect(screen.getAllByText(line).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("Hai đứa nên thử cùng nhau")).toBeInTheDocument();
    for (const act of r.activities!) expect(screen.getByText(act)).toBeInTheDocument();
  });

  it("counts up from 0 when motion is allowed", () => {
    reduceMotion(false);
    render(<CompatView a={A} b={B} nameA={null} nameB={null} mode="viewer-is-b" />);
    expect(screen.getByTestId("compat-total")).toHaveTextContent("0");
  });

  it("is symmetric in pair mode", () => {
    const one = render(<CompatView a={A} b={B} nameA="X" nameB="Y" mode="pair" />);
    const t1 = one.getByTestId("compat-total").textContent;
    const line1 = compatResult(A, B).tier!.line;
    one.unmount();
    render(<CompatView a={B} b={A} nameA="Y" nameB="X" mode="pair" />);
    expect(screen.getByTestId("compat-total").textContent).toBe(t1);
    expect(screen.getByText(line1)).toBeInTheDocument();
  });

  it("shows the master-number note for 22 vs 4", () => {
    render(<CompatView a={{ ...A, lifePath: 22 }} b={B} nameA={null} nameB={null} mode="viewer-is-b" />);
    expect(screen.queryByText(/22 rút gọn về 4/)).toBeNull(); // B is 8: no shared root
    const r = render(<CompatView a={{ ...A, lifePath: 22 }} b={{ ...B, lifePath: 4 }} nameA={null} nameB={null} mode="viewer-is-b" />);
    expect(r.getByText("22 rút gọn về 4 nên hai đứa cùng gốc số")).toBeInTheDocument();
  });

  it("fires compat_full_view once with the tier", () => {
    render(<CompatView a={A} b={B} nameA={null} nameB={null} mode="viewer-is-b" />);
    const calls = vi.mocked(track).mock.calls.filter(([e]) => e === "compat_full_view");
    expect(calls).toEqual([["compat_full_view", { tier: compatResult(A, B).tier!.id }]]);
  });
});

describe("flow wiring", () => {
  it("B's finished test shows the compare above B's own result", () => {
    render(
      <PersonalDefinitionFlow invite={{ person: A, code: encodeInvite({ v: 1, type: "INFP", sign: 11, lifePath: 4 }), name: "Khánh" }} initialBirthDate="2003-07-14" />,
    );
    fireEvent.change(screen.getByPlaceholderText(/tên bạn muốn hiển thị/i), { target: { value: "An" } });
    fireEvent.change(screen.getByLabelText("Trường của bạn"), { target: { value: "ueh" } });
    fireEvent.click(screen.getByRole("button", { name: /^bắt đầu$/i }));
    for (let part = 0; part < PART_COUNT; part++) {
      for (let row = 0; row < PART_SIZE; row++) {
        const rowEl = document.getElementById(`quiz-row-${firstIndexOfPart(part) + row}`)!;
        fireEvent.click(within(rowEl).getAllByRole("radio")[0]!, { detail: 1 });
      }
      fireEvent.click(screen.getByRole("button", { name: `Xong phần ${part + 1}` }));
      fireEvent.click(screen.getByRole("button", { name: part === PART_COUNT - 1 ? "Xem kết quả" : "Đi tiếp" }));
    }
    const total = screen.getByTestId("compat-total");
    const dims = screen.getByText("Bốn chiều của bạn");
    expect(total.compareDocumentPosition(dims) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Bạn × Khánh" })).toBeInTheDocument();
  });
});

describe("pair mode on the hop-nhau route", () => {
  const codeA = encodeInvite({ v: 1, type: "INFP", sign: 11, lifePath: 4 });
  const codeB = encodeInvite({ v: 1, type: "ENFP", sign: 3, lifePath: 8 });
  const open = (q: string, hash = "") => {
    params = new URLSearchParams(q);
    window.history.replaceState(null, "", `/personal-definition/hop-nhau?${q}${hash}`);
    return render(<HopNhauScreen />);
  };

  it("valid i + j renders the compare directly", () => {
    open(`i=${codeA}&j=${codeB}`, "#n=Kh%C3%A1nh&m=An");
    expect(screen.getByRole("heading", { name: "Khánh × An" })).toBeInTheDocument();
    expect(screen.getByTestId("compat-total")).toHaveTextContent(String(compatResult(A, B).total));
    expect(screen.queryByRole("button", { name: "Xem độ hợp ngay" })).toBeNull();
  });

  it("valid i + garbage j shows the error screen", () => {
    open(`i=${codeA}&j=garbage`);
    expect(screen.getByRole("heading", { name: "Link này hơi lạ á 🤔" })).toBeInTheDocument();
  });

  it("only i shows the landing", () => {
    open(`i=${codeA}`);
    expect(screen.getByRole("button", { name: "Xem độ hợp ngay" })).toBeInTheDocument();
  });
});

describe("couple share card button", () => {
  const order: string[] = [];
  beforeEach(() => {
    order.length = 0;
    vi.mocked(track).mockImplementation((e) => void order.push(e));
  });

  it("shares a File named by compatFileName, click before success", async () => {
    const share = vi.fn(async () => void order.push("share"));
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
    render(<CompatView a={A} b={B} nameA="Khánh" nameB="An" mode="pair" />);
    fireEvent.click(screen.getByRole("button", { name: "Vuông" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Chia sẻ thẻ của hai đứa" }));
    });
    const file = (share.mock.calls[0] as unknown as [{ files: File[] }])[0].files[0]!;
    expect(file.name).toBe(compatFileName("Khánh", "An", compatResult(A, B).total!));
    expect(order.filter((e) => e !== "compat_full_view")).toEqual(["compat_share_click", "share", "compat_share_success"]);
    expect(vi.mocked(track)).toHaveBeenCalledWith("compat_share_click", { format: "square" });
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true });
  });

  it("downloads without file sharing and does not count it as a share", async () => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    const clicked = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<CompatView a={A} b={B} nameA="Khánh" nameB="An" mode="pair" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Chia sẻ thẻ của hai đứa" }));
    });
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(vi.mocked(track)).toHaveBeenCalledWith("compat_share_click", { format: "story" });
    expect(vi.mocked(track)).not.toHaveBeenCalledWith("compat_share_success", expect.anything());
  });
});
