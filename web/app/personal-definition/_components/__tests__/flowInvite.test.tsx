import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import PersonalDefinitionPage from "../../page";
import { PersonalDefinitionFlow, type FlowInvite } from "../PersonalDefinitionFlow";
import { BirthDateSelects } from "../BirthDateSelects";

const invite: FlowInvite = {
  person: { type: "INFP", sign: "Song Ngư", element: "Water", lifePath: 4 },
  code: "abc",
  name: "Khánh",
};

describe("PersonalDefinitionFlow", () => {
  // jsdom has no window.scrollTo; the flow scrolls to top on every phase change.
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("page renders the same intro as before", () => {
    render(<PersonalDefinitionPage />);
    expect(screen.getByText("Bạn có đang lạc lối?")).toBeInTheDocument();
  });

  it("an invite flow opens on the form with the birth date pre-filled", () => {
    render(<PersonalDefinitionFlow invite={invite} initialBirthDate="2003-03-14" />);
    expect((screen.getByLabelText("Ngày") as HTMLSelectElement).value).toBe("14");
    expect((screen.getByLabelText("Tháng") as HTMLSelectElement).value).toBe("3");
    expect((screen.getByLabelText("Năm") as HTMLSelectElement).value).toBe("2003");
    expect(screen.queryByText("Bạn có đang lạc lối?")).toBeNull();
  });

  it("Quay lại in an invite flow calls onExitInvite, not the intro", () => {
    const exit = vi.fn();
    render(<PersonalDefinitionFlow invite={invite} initialBirthDate="2003-03-14" onExitInvite={exit} />);
    fireEvent.click(screen.getByRole("button", { name: /Quay lại/ }));
    expect(exit).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Bạn có đang lạc lối?")).toBeNull();
  });
});

describe("BirthDateSelects", () => {
  function Harness({ onEmit }: { onEmit: (v: string) => void }) {
    const [v, setV] = useState("");
    return <BirthDateSelects value={v} onChange={(x) => { setV(x); onEmit(x); }} />;
  }

  it('emits "" while incomplete and the ISO date once all three are chosen', () => {
    const emit = vi.fn();
    render(<Harness onEmit={emit} />);
    fireEvent.change(screen.getByLabelText("Ngày"), { target: { value: "14" } });
    expect(emit).toHaveBeenLastCalledWith("");
    fireEvent.change(screen.getByLabelText("Tháng"), { target: { value: "3" } });
    expect(emit).toHaveBeenLastCalledWith("");
    fireEvent.change(screen.getByLabelText("Năm"), { target: { value: "2003" } });
    expect(emit).toHaveBeenLastCalledWith("2003-03-14");
  });

  it("shows an error when given one", () => {
    render(<BirthDateSelects value="" onChange={() => {}} error="Chọn ngày sinh" />);
    expect(screen.getByText("Chọn ngày sinh")).toBeInTheDocument();
  });
});
