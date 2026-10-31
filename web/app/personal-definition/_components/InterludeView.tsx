"use client";

import { Button } from "@/components/worker/ui/Button";
import { PART_COUNT, PART_SIZE, PART_TITLES } from "../_lib/parts";
import { QUESTION_COUNT } from "../_lib/likert";
import { PART_HOOKS, RESULT_HOOK } from "../_lib/interludeCopy";
import { PART_THEMES } from "../_lib/partTheme";
import type { NumerologyResult, ZodiacResult } from "../_lib/types";
import { srcOf } from "../_lib/mascot";
import styles from "./mascot.module.css";

type Props = {
  /** 0-based index of the part just finished. */
  part: number;
  /** The conclusion drawn from this part's 10 answers (see _lib/partSummary). */
  summary: string;
  /** One slot per part: the letter once that part is done, otherwise null. */
  letters: (string | null)[];
  /**
   * Present only at the 50% boundary. Both values are settled at onboarding,
   * so revealing them here cannot contradict the final profile. Spec §5.
   */
  preview?: { zodiac: ZodiacResult; numerology: NumerologyResult };
  onContinue: () => void;
  onBack: () => void;
};

/** The interpretations run 2-3 sentences; the teaser shows only the first. */
function firstSentence(text: string): string {
  return (text.split(/[.!?](?:\s|$)/)[0] ?? text).trim();
}

function TeaserRow({ badge, label, value }: { badge: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border border-worker-border rounded-worker-md px-4 py-3 bg-white">
      <span className="text-lg text-worker-primary shrink-0" aria-hidden>{badge}</span>
      <div className="flex flex-col text-left">
        <span className="text-xs text-worker-text-secondary">{label}</span>
        <span className="text-sm text-worker-text-primary">{value}</span>
      </div>
    </div>
  );
}

/*
 * Each break screen wears the landing card of the part just finished —
 * same bg, ring, well gradient, badge and full-body mascot (PART_THEMES) —
 * so "the card you tapped" and "the part you finished" read as one thing.
 * Theme colours are runtime values, applied via inline style. Copy stays
 * neutral and bold; pink remains on the primary button and teaser badges.
 */
export function InterludeView({ part, summary, letters, preview, onContinue, onBack }: Props) {
  const t = PART_THEMES[part] ?? PART_THEMES[PART_THEMES.length - 1]!;
  const isLast = part >= PART_COUNT - 1;
  const known = letters.filter(Boolean).length;
  const remaining = QUESTION_COUNT - (part + 1) * PART_SIZE;

  return (
    <div className="flex flex-col items-center text-center gap-4 py-4">
      <section
        data-testid="interlude-card"
        className="w-full p-3 rounded-[28px]"
        style={{ backgroundColor: t.bg, boxShadow: `0 0 0 1px ${t.ring}, 0 8px 20px rgba(148,163,184,.18)` }}
      >
        <div
          className="relative aspect-[4/3] rounded-[22px] overflow-hidden flex items-end justify-center"
          style={{ background: t.well }}
        >
          <span
            className="absolute left-3 top-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: t.badge, color: t.badgeInk }}
          >
            Phần {part + 1}/{PART_COUNT} · {t.letters[0]} ↔ {t.letters[1]}
          </span>
          <img
            src={srcOf(t.mascot)}
            alt=""
            className={`h-[86%] w-auto object-contain drop-shadow-[0_12px_16px_rgba(15,23,42,.14)] ${styles.popIn}`}
          />
        </div>

        <div className={`px-2 pt-4 pb-2 ${styles.fadeUp}`}>
          <h2 className="text-[22px] font-extrabold text-worker-text-primary">
            Xong phần {part + 1}/{PART_COUNT} rồi!
          </h2>
          <p data-testid="interlude-line" className="mt-2 text-[15px] leading-relaxed font-bold text-worker-text-primary">
            {summary}
          </p>
        </div>
      </section>

      <div className={`w-full flex flex-col gap-2 ${styles.fadeUpLate}`}>
        {preview && (
          <div data-testid="teaser" className="flex flex-col gap-2">
            <TeaserRow
              badge="★"
              label={preview.zodiac.sun_sign}
              value={preview.zodiac.traits[0] ?? ""}
            />
            <TeaserRow
              badge={String(preview.numerology.life_path)}
              label="Số Chủ Đạo"
              value={firstSentence(preview.numerology.interpretations.life_path)}
            />
          </div>
        )}

        {/* The type fills in one letter per part; the full result (nickname,
            mascot, breakdown) stays locked until the result screen. */}
        <div
          data-testid="teaser-locked"
          className="flex items-center gap-3 rounded-worker-md px-4 py-3 bg-white"
          style={{ boxShadow: `0 0 0 1px ${t.ring}` }}
        >
          <span className="text-lg shrink-0" aria-hidden>{isLast ? "🔓" : "🔒"}</span>
          <div className="flex flex-col text-left">
            <span className="text-xs text-worker-text-secondary">Nhóm tính cách MBTI</span>
            <span
              data-testid="revealed-letters"
              aria-label={`Đã biết ${known}/${PART_COUNT} chữ: ${letters.filter(Boolean).join(", ")}`}
              className="flex gap-1.5 text-lg font-extrabold tracking-wide text-worker-text-primary"
            >
              {letters.map((l, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={l ? "" : "text-worker-text-disabled"}
                  style={i === part && l ? { color: t.chip } : undefined}
                >
                  {l ?? "_"}
                </span>
              ))}
            </span>
            <span className="text-xs text-worker-text-secondary">
              {isLast ? "Mở khoá đầy đủ ở màn kết quả" : `Còn ${remaining} câu nữa`}
            </span>
          </div>
        </div>

        {/* The hook: what the next screen promises, to pull the next tap. */}
        <div data-testid="next-hook" className="flex flex-col gap-0.5 mt-2 mx-auto max-w-[320px]">
          <p className="text-sm text-worker-text-secondary">
            Tiếp theo:{" "}
            <span className="font-bold text-worker-text-primary">
              {isLast ? "Kết quả của bạn" : PART_TITLES[part + 1]}
            </span>
          </p>
          <p className="text-sm font-semibold italic text-worker-text-secondary">
            {isLast ? RESULT_HOOK : `“${PART_HOOKS[part + 1]}”`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1" aria-hidden>
        {Array.from({ length: PART_COUNT }, (_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: i <= part ? t.badge : "var(--color-worker-border)" }}
          />
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <Button variant="secondary" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={onContinue}>
          {isLast ? "Xem kết quả" : "Đi tiếp"}
        </Button>
      </div>
    </div>
  );
}
