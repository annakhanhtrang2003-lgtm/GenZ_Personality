import { ResultCard } from "./ResultCard";
import type { NumerologyResult } from "../../_lib/types";

/**
 * Số chủ đạo: the life path number, from the birth date alone. Only this
 * number is shown — the name-based ones (Sứ Mệnh, Linh Hồn, Nhân Cách) are
 * not, since the form now asks for a display name, not a legal full name.
 */
export function LifePathCard({ numerology, accent }: { numerology: NumerologyResult; accent: string }) {
  return (
    <ResultCard title="Số chủ đạo của bạn" accent={accent}>
      <div data-testid="life-path" className="flex items-start gap-4">
        <span
          className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-[32px] font-extrabold text-white"
          style={{ backgroundColor: accent }}
        >
          {numerology.life_path}
        </span>
        <p className="text-[15px] leading-relaxed text-[#1e293b]">{numerology.interpretations.life_path}</p>
      </div>
      <p className="text-xs text-[#64748b]">Tính từ ngày sinh của bạn theo thần số học Pythagoras.</p>
    </ResultCard>
  );
}
