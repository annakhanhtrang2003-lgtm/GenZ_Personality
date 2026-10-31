import { ResultCard, Chip } from "./ResultCard";
import type { NumerologyResult, ZodiacResult } from "../../_lib/types";

/**
 * Details for the two tiles at the top: the full Số chủ đạo meaning (from
 * the birth date) and the sun sign's traits. Only the life path number is
 * shown — the name-based ones (Sứ Mệnh, Linh Hồn, Nhân Cách) are not, since
 * the form now asks for a display name, not a legal full name.
 */
export function LifePathCard({
  numerology,
  zodiac,
  accent,
}: {
  numerology: NumerologyResult;
  zodiac: ZodiacResult;
  accent: string;
}) {
  return (
    <ResultCard title="Số chủ đạo & cung hoàng đạo" accent={accent}>
      <div data-testid="life-path" className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <span
            className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] font-extrabold text-white"
            style={{ backgroundColor: accent }}
          >
            {numerology.life_path}
          </span>
          <p className="text-[15px] leading-relaxed text-[#1e293b]">{numerology.interpretations.life_path}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-[#1e293b]">{zodiac.sun_sign} trong bạn:</p>
          <div className="flex flex-wrap gap-2">
            {zodiac.traits.map((t) => (
              <Chip key={t} label={t} accent={accent} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-[#64748b]">Tính từ ngày sinh của bạn: thần số học Pythagoras và cung mặt trời.</p>
    </ResultCard>
  );
}
