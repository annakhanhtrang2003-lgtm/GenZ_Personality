import { StickerCard } from "./StickerCard";
import type { MBTIResult, NumerologyResult, ZodiacResult } from "../../_lib/types";

const ZODIAC_SYMBOL: Record<string, string> = {
  "Bạch Dương": "♈", "Kim Ngưu": "♉", "Song Tử": "♊", "Cự Giải": "♋",
  "Sư Tử": "♌", "Xử Nữ": "♍", "Thiên Bình": "♎", "Bọ Cạp": "♏",
  "Nhân Mã": "♐", "Ma Kết": "♑", "Bảo Bình": "♒", "Song Ngư": "♓",
};

/** First sentence only — the tile is half the width; the details card has the rest. */
function firstSentence(text: string): string {
  return (text.split(/[.!?](?:\s|$)/)[0] ?? text).trim();
}

function Tile({
  testId, label, value, line, accent,
}: { testId: string; label: string; value: string; line: string; accent: string }) {
  return (
    <div
      data-testid={testId}
      className="flex-1 flex flex-col gap-1 rounded-2xl bg-white px-3 py-3 text-left shadow-[0_8px_20px_-12px_rgba(15,23,42,.25)]"
      style={{ boxShadow: `0 0 0 1px ${accent}26, 0 8px 20px -12px rgba(15,23,42,.25)` }}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">{label}</span>
      <span className="text-[21px] leading-tight font-extrabold whitespace-nowrap" style={{ color: accent }}>{value}</span>
      <span className="text-[13px] leading-snug text-[#334155] line-clamp-3">{line}</span>
    </div>
  );
}

/**
 * Top of the result: the sticker card on the left, the life path number and
 * sun sign on the right; then type, label, name and the narrative. The full
 * life path meaning and zodiac traits live in the details card below.
 */
export function ResultHero({
  mbti,
  name,
  narrative,
  accent,
  numerology,
  zodiac,
}: {
  mbti: MBTIResult;
  name: string;
  narrative: string;
  accent: string;
  numerology: NumerologyResult;
  zodiac: ZodiacResult;
}) {
  const symbol = ZODIAC_SYMBOL[zodiac.sun_sign];
  return (
    <header className="flex flex-col items-center text-center gap-3">
      <div data-testid="result-top" className="w-full grid grid-cols-2 gap-3 items-start">
        <div className="flex justify-center">
          <StickerCard type={mbti.type} />
        </div>
        <div className="flex flex-col gap-3 self-stretch">
          <Tile
            testId="hero-life-path"
            label="Số chủ đạo"
            value={String(numerology.life_path)}
            line={firstSentence(numerology.interpretations.life_path)}
            accent={accent}
          />
          <Tile
            testId="hero-zodiac"
            label={symbol ? `Cung hoàng đạo ${symbol}` : "Cung hoàng đạo"}
            value={zodiac.sun_sign}
            line={zodiac.traits[0] ?? ""}
            accent={accent}
          />
        </div>
      </div>
      <h1 className="mt-3 text-[40px] leading-none font-extrabold tracking-wide" style={{ color: accent }}>
        {mbti.type}
      </h1>
      <p className="text-lg font-semibold text-[#1e293b]">{mbti.label}</p>
      <p data-testid="result-name" className="text-sm text-[#475569] break-words max-w-full">
        {name}
      </p>
      <p className="mt-2 text-left text-base leading-relaxed text-[#1e293b]">{narrative}</p>
    </header>
  );
}
