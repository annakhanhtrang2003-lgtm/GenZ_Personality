"use client";

import { useState } from "react";
import { Select } from "@/components/worker/ui/Select";
import { YEARS, MONTHS, daysInMonth, toIso, fromIso } from "../_lib/birthdate";

const numeric = (v: string): number | null => (v === "" ? null : Number(v));

/**
 * Day / month / year selects that emit an ISO date, or "" while incomplete.
 * Shared by the onboarding form and the "Hợp nhau" landing.
 */
export function BirthDateSelects({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (iso: string) => void;
  error?: string;
}) {
  // Local state, not derived from `value` on every render: while the
  // selection is incomplete the emitted value is "" (see toIso), so deriving
  // straight from props would forget an in-progress day/month the instant the
  // next part is picked. Seeded once from the incoming value so a pre-filled
  // date still shows (a remount restores a completed date; a half-picked one
  // emits "" and is not restored).
  const initialParts = fromIso(value);
  const [day, setDay] = useState<number | null>(initialParts?.day ?? null);
  const [month, setMonth] = useState<number | null>(initialParts?.month ?? null);
  const [year, setYear] = useState<number | null>(initialParts?.year ?? null);

  // Without a month a 31-day list is the honest default; it narrows as soon
  // as a month is picked. Year matters only for February.
  const dayCount = month ? daysInMonth(month, year ?? 2004) : 31;

  const emit = (d: number | null, m: number | null, y: number | null) => {
    setDay(d);
    setMonth(m);
    setYear(y);
    onChange(toIso(d, m, y));
  };

  return (
    <div>
      <span className="text-xs text-worker-text-secondary">Ngày sinh</span>
      <div className="flex gap-2 mt-1">
        <Select
          label="Ngày"
          value={day ? String(day) : ""}
          onChange={(v) => emit(numeric(v), month, year)}
          options={Array.from({ length: dayCount }, (_, i) => ({
            value: String(i + 1),
            label: String(i + 1),
          }))}
          placeholder="Ngày"
        />
        <Select
          label="Tháng"
          value={month ? String(month) : ""}
          onChange={(v) => emit(day, numeric(v), year)}
          options={MONTHS.map((m) => ({ value: String(m), label: `Tháng ${m}` }))}
          placeholder="Tháng"
        />
        <Select
          label="Năm"
          value={year ? String(year) : ""}
          onChange={(v) => emit(day, month, numeric(v))}
          options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
          placeholder="Năm"
        />
      </div>
      {error && <p className="text-xs text-worker-danger mt-1">{error}</p>}
    </div>
  );
}
