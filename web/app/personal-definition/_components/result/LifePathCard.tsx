import { ResultCard, Chip } from "./ResultCard";
import type { NumerologyResult, ZodiacResult } from "../../_lib/types";
import { famousWithLifePath, famousWithSign, lifePathOthers, zodiacProfile, type FamousPerson } from "../../_lib/famous";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-bold text-[#1e293b]">{title}</p>
      {children}
    </div>
  );
}

/** "Cùng số 4 với" / "Cùng cung với": name + what they are known for. */
function FamousList({ title, people, accent }: { title: string; people: FamousPerson[]; accent: string }) {
  if (people.length === 0) return null;
  return (
    <Block title={title}>
      <ul className="flex flex-col gap-1.5">
        {people.map((p) => (
          <li key={p.name} className="flex items-baseline gap-2 text-[14px] text-[#1e293b]">
            <span aria-hidden className="text-xs" style={{ color: accent }}>★</span>
            <span>
              <b>{p.name}</b> <span className="text-[#64748b]">· {p.known_for}</span>
            </span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

const SOURCE_NOTE =
  "Ngày sinh người nổi tiếng lấy từ nguồn công khai; số và cung của họ được tính bằng đúng công thức đã tính cho bạn.";

/**
 * Số chủ đạo details: the meaning (from the birth date), how people tend to
 * see this number, and well-known people who share it. Only the life path
 * number is shown — the name-based numbers are not (display name only).
 */
export function LifePathCard({ numerology, accent }: { numerology: NumerologyResult; accent: string }) {
  const n = numerology.life_path;
  const others = lifePathOthers(n);
  return (
    <ResultCard title="Số chủ đạo của bạn" accent={accent}>
      <div data-testid="life-path" className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <span
            className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] font-extrabold text-white"
            style={{ backgroundColor: accent }}
          >
            {n}
          </span>
          <p className="text-[15px] leading-relaxed text-[#1e293b]">{numerology.interpretations.life_path}</p>
        </div>
        {others && (
          <Block title={`Mọi người hay nhìn số ${n} là`}>
            <p className="text-[15px] leading-relaxed text-[#334155]">{others}</p>
          </Block>
        )}
        <FamousList title={`Cùng số ${n} với`} people={famousWithLifePath(n)} accent={accent} />
        <p className="text-xs text-[#64748b]">{SOURCE_NOTE}</p>
      </div>
    </ResultCard>
  );
}

/**
 * Cung hoàng đạo details: what the sign is like, how people usually see it,
 * its traits, and well-known people born under it.
 */
export function ZodiacCard({ zodiac, accent }: { zodiac: ZodiacResult; accent: string }) {
  const sign = zodiac.sun_sign;
  const profile = zodiacProfile(sign);
  return (
    <ResultCard title="Cung hoàng đạo của bạn" accent={accent}>
      <div data-testid="zodiac-card" className="flex flex-col gap-4">
        {profile && (
          <>
            <Block title={`${sign} là người thế nào`}>
              <p className="text-[15px] leading-relaxed text-[#1e293b]">{profile.self}</p>
            </Block>
            <Block title={`Mọi người hay nhìn ${sign} là`}>
              <p className="text-[15px] leading-relaxed text-[#334155]">{profile.others}</p>
            </Block>
          </>
        )}
        <Block title="Nét đặc trưng">
          <div className="flex flex-wrap gap-2">
            {zodiac.traits.map((t) => (
              <Chip key={t} label={t} accent={accent} />
            ))}
          </div>
        </Block>
        <FamousList title={`Cùng cung ${sign} với`} people={famousWithSign(sign)} accent={accent} />
        <p className="text-xs text-[#64748b]">{SOURCE_NOTE}</p>
      </div>
    </ResultCard>
  );
}
