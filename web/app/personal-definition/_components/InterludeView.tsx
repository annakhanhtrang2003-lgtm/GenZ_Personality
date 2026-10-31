"use client";

import { Button } from "@/components/worker/ui/Button";
import { PART_COUNT, PART_SIZE, PART_TITLES } from "../_lib/parts";
import { QUESTION_COUNT } from "../_lib/likert";
import { PART_HOOKS, RESULT_HOOK } from "../_lib/interludeCopy";
import type { NumerologyResult, ZodiacResult } from "../_lib/types";
import { FACES, srcOf, type FaceName } from "../_lib/mascot";
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
    <div className="flex items-center gap-3 border border-worker-border rounded-worker-md px-4 py-3">
      <span className="text-lg text-worker-primary shrink-0" aria-hidden>{badge}</span>
      <div className="flex flex-col text-left">
        <span className="text-xs text-worker-text-secondary">{label}</span>
        <span className="text-sm text-worker-text-primary">{value}</span>
      </div>
    </div>
  );
}

/*
 * Colour rule: copy is neutral (text-primary / text-secondary). Pink is kept
 * for the primary button, the progress dots and one small accent — the
 * teaser badges (★, life-path number).
 */

/** One mascot face per boundary, index = part just finished. */
const FACE_BY_PART: FaceName[] = ["laugh", "excited", "confident", "grin"];

export function InterludeView({ part, summary, letters, preview, onContinue, onBack }: Props) {
  const face = FACE_BY_PART[part] ?? FACE_BY_PART[FACE_BY_PART.length - 1]!;
  const isLast = part >= PART_COUNT - 1;
  const known = letters.filter(Boolean).length;
  const remaining = QUESTION_COUNT - (part + 1) * PART_SIZE;

  return (
    <div className="flex flex-col items-center text-center gap-4 py-10">
      <img
        src={srcOf(FACES[face])}
        alt=""
        className={`w-28 h-28 object-contain ${styles.bounceIn}`}
      />

      <h2 className="text-[22px] font-semibold text-worker-text-primary">
        Xong phần {part + 1}/{PART_COUNT} rồi!
      </h2>

      <p data-testid="interlude-line" className="text-[15px] leading-relaxed text-worker-text-primary max-w-[340px]">
        {summary}
      </p>

      <div className="w-full flex flex-col gap-2 mt-2">
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
          className="flex items-center gap-3 border border-worker-border rounded-worker-md px-4 py-3"
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
                <span key={i} aria-hidden className={l ? "" : "text-worker-text-disabled"}>
                  {l ?? "_"}
                </span>
              ))}
            </span>
            <span className="text-xs text-worker-text-secondary">
              {isLast ? "Mở khoá đầy đủ ở màn kết quả" : `Còn ${remaining} câu nữa`}
            </span>
          </div>
        </div>
      </div>

      {/* The hook: what the next screen promises, to pull the next tap. */}
      <div data-testid="next-hook" className="flex flex-col gap-0.5 max-w-[320px]">
        <p className="text-sm text-worker-text-secondary">
          Tiếp theo:{" "}
          <span className="font-semibold text-worker-text-primary">
            {isLast ? "Kết quả của bạn" : PART_TITLES[part + 1]}
          </span>
        </p>
        <p className="text-sm italic text-worker-text-secondary">
          {isLast ? RESULT_HOOK : `“${PART_HOOKS[part + 1]}”`}
        </p>
      </div>

      <div className="flex items-center gap-1.5 mt-2" aria-hidden>
        {Array.from({ length: PART_COUNT }, (_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i <= part ? "bg-worker-primary" : "bg-worker-border"}`}
          />
        ))}
      </div>

      <div className="flex gap-2 mt-2">
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
