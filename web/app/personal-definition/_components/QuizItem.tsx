"use client";

import { likertFor } from "../_lib/likert";
import { indexWithinPart } from "../_lib/parts";
import { LikertScale } from "./LikertScale";
import type { Response } from "../_lib/types";

type Props = {
  /** Absolute index into the bank, 0..39. */
  index: number;
  text: string;
  value: Response | null;
  /** The row the flow is on — where QuizPart scrolls after each tap. */
  isCurrent: boolean;
  /** `advance` distinguishes a pointer/touch answer from a keyboard one — see LikertScale. */
  onAnswer: (v: Response, advance: boolean) => void;
};

/**
 * One question, always fully shown with its scale (no accordion). An
 * answered row dims once the flow moves past it, so the current question
 * stands out; hovering or focusing it brings it back to full strength.
 */
export function QuizItem({ index, text, value, isCurrent, onAnswer }: Props) {
  const ordinal = indexWithinPart(index) + 1;
  const answered = value !== null;
  const dimmed = answered && !isCurrent;

  return (
    <div
      id={`quiz-row-${index}`}
      data-current={isCurrent ? "true" : "false"}
      data-dimmed={dimmed ? "true" : "false"}
      className={`border-b border-worker-border last:border-b-0 py-4 scroll-mt-24 transition-opacity duration-300 motion-reduce:transition-none ${
        dimmed ? "opacity-50 hover:opacity-100 focus-within:opacity-100" : ""
      }`}
    >
      <p className="flex items-start gap-3">
        <span className="w-5 shrink-0 text-sm text-worker-text-secondary">{ordinal}.</span>
        <span className="flex-1 text-[15px] leading-snug text-worker-text-primary font-semibold">{text}</span>
        {answered && (
          <span data-testid="row-answered" className="shrink-0 text-sm text-worker-primary" aria-hidden>
            ✓
          </span>
        )}
      </p>

      <div className="pt-3 pl-8 pr-2">
        <LikertScale
          options={likertFor(index)}
          value={value}
          onChange={onAnswer}
          questionId={String(index)}
          question={`Câu hỏi: ${text}`}
        />
      </div>
    </div>
  );
}
