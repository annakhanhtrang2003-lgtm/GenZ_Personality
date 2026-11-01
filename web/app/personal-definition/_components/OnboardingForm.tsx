"use client";

import { TextInput } from "@/components/worker/ui/TextInput";
import { Select } from "@/components/worker/ui/Select";
import { HERO_MASCOT } from "../_lib/partTheme";
import { srcOf } from "../_lib/mascot";
import universities from "../_lib/data/universities.json";
import type { Input, InputErrors } from "../_lib/state";
import { BirthDateSelects } from "./BirthDateSelects";

type Props = {
  input: Input;
  errors: InputErrors;
  onChange: (field: keyof Input, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

// 'other' always sorts last so a student whose school is missing is never blocked.
const OPTIONS = [...(universities as { id: string; name: string }[])]
  .sort((a, b) => (a.id === "other" ? 1 : b.id === "other" ? -1 : 0))
  .map((u) => ({ value: u.id, label: u.name }));

export function OnboardingForm({ input, errors, onChange, onSubmit, onBack }: Props) {
  return (
    <div className="min-h-[100svh] px-5 pt-3 pb-10 bg-[linear-gradient(180deg,#ffe4e6,#fdf2f8_50%,#ede9fe)]">
      <div className="max-w-[440px] mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 min-h-11 min-w-11 px-2 inline-flex items-center gap-1 text-sm font-medium text-[#475569] rounded-full focus-visible:outline-2 focus-visible:outline-[#ec4899]"
        >
          <span aria-hidden>←</span>
          Quay lại
        </button>

        <div className="mt-2 bg-white rounded-[24px] shadow-[0_6px_14px_rgba(148,163,184,.18)] px-5 pt-5 pb-6">
          <img src={srcOf(HERO_MASCOT)} alt="" className="w-[72px] h-[72px] object-contain mx-auto mb-2" />
          <h1 className="text-[26px] font-bold text-[#1e293b] mb-1 text-center">
            Khám phá{" "}
            <span className="bg-[linear-gradient(90deg,#ec4899,#8b5cf6)] bg-clip-text text-transparent">bản thân</span>
          </h1>
          <p className="text-sm text-[#475569] mb-6 text-center">
            Vài thông tin nhỏ để bắt đầu — không lưu lại đâu, chỉ dùng cho lần này thôi.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <TextInput
                value={input.name}
                onChange={(v) => onChange("name", v)}
                placeholder="Tên bạn muốn hiển thị"
              />
              {errors.name && <p className="text-xs text-worker-danger mt-1">{errors.name}</p>}
            </div>

            <Select
              label="Trường của bạn"
              value={input.university}
              onChange={(v) => onChange("university", v)}
              options={OPTIONS}
              placeholder="Chọn trường"
              error={errors.university}
            />

            <BirthDateSelects
              value={input.birth_date}
              onChange={(v) => onChange("birth_date", v)}
              error={errors.birth_date}
            />

            <button
              type="submit"
              className="w-full rounded-full py-4 px-6 text-[17px] font-bold text-white bg-[linear-gradient(90deg,#ec4899,#fb7185)] shadow-[0_10px_20px_-6px_rgba(236,72,153,.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f9a8d4]"
            >
              Bắt đầu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
