import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { buildProfile } from "../../_lib/profile";
import { QUESTION_COUNT } from "../../_lib/likert";
import type { Response } from "../../_lib/types";

vi.mock("../../_lib/shareImage", async (orig) => {
  const real = await orig<typeof import("../../_lib/shareImage")>();
  return { ...real, renderShareImage: vi.fn(async () => new Blob(["png"], { type: "image/png" })) };
});

import { ResultActions } from "../result/ResultActions";

const profile = buildProfile({
  name: "Khanh",
  full_name: "Khanh",
  university: "ueh",
  birth_date: "2003-03-14",
  responses: Array.from({ length: QUESTION_COUNT }, (_, i) => ((i % 5) - 2) as Response),
});

describe("ResultActions", () => {
  let clicked: string[] = [];
  beforeEach(() => {
    clicked = [];
    URL.createObjectURL = vi.fn(() => "blob:share");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this.download);
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error test cleanup
    delete navigator.share;
    // @ts-expect-error test cleanup
    delete navigator.canShare;
  });

  it("has a single share button — download is folded into it", () => {
    render(<ResultActions profile={profile} accent="#6d28d9" />);
    expect(screen.getByRole("button", { name: /Chia sẻ kết quả/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tải ảnh/ })).not.toBeInTheDocument();
  });

  it("shares the image as a file where the browser can", async () => {
    const share = vi.fn(async (_data: ShareData) => {});
    Object.assign(navigator, { share, canShare: () => true });
    render(<ResultActions profile={profile} accent="#6d28d9" />);
    fireEvent.click(screen.getByRole("button", { name: /Chia sẻ/ }));
    await waitFor(() => expect(share).toHaveBeenCalledOnce());
    const arg = share.mock.calls[0]![0];
    expect(arg.files?.[0]?.name).toBe(`${profile.user.name}_${profile.mbti.type}_${profile.numerology.life_path}.png`);
    expect(clicked).toEqual([]);
  });

  it("downloads name_mbti_number.png when file sharing is not supported", async () => {
    render(<ResultActions profile={profile} accent="#6d28d9" />);
    fireEvent.click(screen.getByRole("button", { name: /Chia sẻ/ }));
    await waitFor(() => expect(clicked).toEqual([`${profile.user.name}_${profile.mbti.type}_${profile.numerology.life_path}.png`]));
    expect(screen.getByRole("status")).toHaveTextContent(/tải ảnh về/);
  });

  it("stays quiet when the person cancels the share sheet", async () => {
    const share = vi.fn(async () => {
      throw new DOMException("cancel", "AbortError");
    });
    Object.assign(navigator, { share, canShare: () => true });
    render(<ResultActions profile={profile} accent="#6d28d9" />);
    fireEvent.click(screen.getByRole("button", { name: /Chia sẻ/ }));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(clicked).toEqual([]);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("no longer links to CareerPath", () => {
    render(<ResultActions profile={profile} accent="#6d28d9" />);
    expect(screen.queryByRole("link", { name: /Khám phá lộ trình nghề nghiệp/ })).not.toBeInTheDocument();
  });
});
