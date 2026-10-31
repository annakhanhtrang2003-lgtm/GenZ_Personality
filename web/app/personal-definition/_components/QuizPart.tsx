"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/worker/ui/Button";
import { ProgressBar } from "@/components/worker/ui/ProgressBar";
import { PART_COUNT, PART_SIZE, PART_TITLES, indicesOfPart } from "../_lib/parts";
import { srcOf } from "../_lib/mascot";
import { PART_THEMES } from "../_lib/partTheme";
import { QuizItem } from "./QuizItem";
import type { Response } from "../_lib/types";
import bank from "../_lib/data/questions.json";
import styles from "./mascot.module.css";

const ITEMS = (bank as { items: { text: string }[] }).items;

type Props = {
  part: number;
  responses: (Response | null)[];
  open: number | null;
  /** `advance` distinguishes a pointer/touch answer from a keyboard one — see LikertScale. */
  onAnswer: (index: number, v: Response, advance: boolean) => void;
  onFinishPart: () => void;
  onBack: () => void;
};

export function QuizPart({
  part, responses, open, onAnswer, onFinishPart, onBack,
}: Props) {
  const indices = indicesOfPart(part);
  const answered = indices.filter((i) => responses[i] !== null).length;
  const complete = answered === PART_SIZE;
  const theme = PART_THEMES[part]!;

  // Set right before a pointer-triggered ANSWER, so the effect below knows
  // the next `open` change is an auto-advance to follow with a scroll — as
  // opposed to a keyboard ANSWER, which leaves `open` where it was and must
  // not yank the page while someone moves with Tab/arrows.
  const pendingScrollRef = useRef(false);
  const finishRef = useRef<HTMLDivElement>(null);

  // Every question is on screen, so the flow is kept by scrolling: the next
  // unanswered question glides to the middle of the screen, or — once the
  // part is complete (open === null) — the end-of-part button does. Focus
  // stays where it is. scrollIntoView is optional-called for jsdom.
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    const target = open !== null ? document.getElementById(`quiz-row-${open}`) : finishRef.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView?.({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [open]);

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex flex-col items-center text-center gap-2 rounded-[24px] px-4 py-5"
        style={{ backgroundColor: theme.bg, boxShadow: `0 0 0 1px ${theme.ring}` }}
      >
        <div className="flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: PART_COUNT }, (_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= part ? "bg-worker-primary" : "bg-worker-border"}`}
            />
          ))}
        </div>

        <span className="text-xs text-worker-text-secondary">
          Phần {part + 1}/{PART_COUNT}
        </span>
        <span
          data-testid="part-letters"
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: theme.badge, color: theme.badgeInk }}
        >
          {theme.letters[0]} · {theme.letters[1]}
        </span>
        <p className="text-sm font-medium" style={{ color: theme.chip }}>
          {PART_TITLES[part]}
        </p>

        {/* The dimension mascots are single images with no expressions, so
            progress shows as a bounce instead: keying on `answered` remounts
            the img, which replays pulseOnChange on every new answer. */}
        <img
          key={answered}
          src={srcOf(theme.mascot)}
          alt=""
          className={`w-20 h-20 object-contain ${styles.pulseOnChange}`}
        />

        <div className="w-full max-w-[280px]">
          <ProgressBar value={(answered / PART_SIZE) * 100} />
        </div>
        <p className="text-xs text-worker-text-secondary">
          {answered}/{PART_SIZE} câu
        </p>
      </div>

      <div className="flex flex-col">
        {indices.map((index) => (
          <QuizItem
            key={index}
            index={index}
            text={ITEMS[index]!.text}
            value={responses[index] ?? null}
            isCurrent={open === index}
            onAnswer={(v, advance) => {
              if (advance) pendingScrollRef.current = true;
              onAnswer(index, v, advance);
            }}
          />
        ))}
      </div>

      <div ref={finishRef} className="flex justify-between gap-2">
        {part > 0 ? (
          <Button variant="secondary" onClick={onBack}>
            Quay lại
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={onFinishPart} disabled={!complete}>
          {`Xong phần ${part + 1}`}
        </Button>
      </div>
    </div>
  );
}
