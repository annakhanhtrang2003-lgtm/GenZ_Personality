"use client";

import { useEffect, useRef, useState } from "react";
import { PART_THEMES } from "../../_lib/partTheme";
import { PART_SIZE } from "../../_lib/parts";
import { QUESTION_COUNT } from "../../_lib/likert";
import { srcOf } from "../../_lib/mascot";

export const PREVIEW_ID = "pd-quiz-preview";

/**
 * Card title per part, index = part (same order as PART_THEMES). Cards are
 * sized for ~2.5 per phone screen, so the longer description line was cut.
 */
const CARDS = [
  { title: "Sóng não cực mạnh hay cần sạc pin?" },
  { title: "Thực tế phũ phàng hay hệ tâm linh?" },
  { title: "Não nhảy số hay tim lên tiếng?" },
  { title: "Kế hoạch 5 năm hay nước đến chân mới nhảy?" },
] as const;

/** Track's inline padding; card offsets are measured from it. */
const TRACK_PAD = 24;

/** Auto-scroll: a slow drift that hints "there is more to the right". */
const AUTO_SPEED = 22; // px per second
export const AUTO_START_DELAY = 1200; // ms on screen before it starts
const STOP_EVENTS = ["pointerdown", "touchstart", "mouseenter", "wheel", "keydown", "focusin"] as const;

export function QuizPreview({ onStart }: { onStart: () => void }) {
  const trackRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  const syncActive = () => {
    const track = trackRef.current;
    if (!track) return;
    let best = 0;
    let dist = Infinity;
    Array.from(track.children).forEach((li, i) => {
      const d = Math.abs((li as HTMLElement).offsetLeft - TRACK_PAD - track.scrollLeft);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setActive(best);
  };

  /**
   * Drifts the track right once it is mostly on screen, then stops for good
   * at the last card (no wrap, so no jump back) or the moment the person
   * touches, swipes, hovers, scrolls or tabs into it. Never runs under
   * prefers-reduced-motion. Snap is suspended while drifting — mandatory
   * snap would pull every sub-pixel step back to the nearest card.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = 0;
    let pos = 0;
    let running = false;
    let done = false;

    const pause = () => {
      running = false;
      clearTimeout(timer);
      window.cancelAnimationFrame(raf);
    };
    const stop = () => {
      if (done) return;
      done = true;
      pause();
      track.style.scrollSnapType = "";
    };
    const frame = (t: number) => {
      if (!running) return;
      if (last) pos += ((t - last) / 1000) * AUTO_SPEED;
      last = t;
      const max = track.scrollWidth - track.clientWidth;
      if (pos >= max) {
        track.scrollLeft = Math.max(0, max);
        stop();
        return;
      }
      track.scrollLeft = pos;
      raf = window.requestAnimationFrame(frame);
    };
    const start = () => {
      if (done || running) return;
      running = true;
      last = 0;
      pos = track.scrollLeft;
      track.style.scrollSnapType = "none";
      raf = window.requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (done) return;
        if (entry?.isIntersecting) timer = setTimeout(start, AUTO_START_DELAY);
        else pause();
      },
      { threshold: 0.6 },
    );
    io.observe(track);
    STOP_EVENTS.forEach((ev) => track.addEventListener(ev, stop, { passive: true }));
    return () => {
      io.disconnect();
      pause();
      STOP_EVENTS.forEach((ev) => track.removeEventListener(ev, stop));
    };
  }, []);

  /**
   * Where the last press on the track began. A pointer click whose finger
   * moved, or whose track scrolled underneath it, was a swipe — not a pick.
   * Keyboard activation (Enter/Space on the button) has `detail === 0` and
   * is never treated as a swipe.
   */
  const pressRef = useRef<{ x: number; y: number; scroll: number } | null>(null);
  const SWIPE_SLOP = 10;

  const onCardClick = (e: React.MouseEvent) => {
    const press = pressRef.current;
    const track = trackRef.current;
    if (e.detail > 0 && press && track) {
      const moved =
        Math.abs(e.clientX - press.x) > SWIPE_SLOP ||
        Math.abs(e.clientY - press.y) > SWIPE_SLOP ||
        Math.abs(track.scrollLeft - press.scroll) > SWIPE_SLOP;
      if (moved) return;
    }
    onStart();
  };

  // Element.scrollTo is optional-called: jsdom and some old WebViews lack it.
  // `active` is set directly so the dot reflects the choice either way.
  const goTo = (i: number) => {
    const track = trackRef.current;
    const li = track?.children[i] as HTMLElement | undefined;
    if (track && li) {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo?.({ left: li.offsetLeft - TRACK_PAD, behavior: reduce ? "auto" : "smooth" });
    }
    setActive(i);
  };

  return (
    <section
      id={PREVIEW_ID}
      aria-labelledby="pd-qp-title"
      className="relative -mt-8 bg-white rounded-t-[28px] pt-9 pb-10 shadow-[0_-8px_24px_rgba(131,24,67,.06)]"
    >
      <div className="max-w-[880px] mx-auto">
        <header className="px-6 max-w-[600px] mx-auto">
          <p className="text-xs font-semibold tracking-[.12em] uppercase text-[#ec4899]">
            {QUESTION_COUNT} câu hỏi · {PART_THEMES.length} phần
          </p>
          <h2 id="pd-qp-title" className="mt-2 text-[23px] leading-[1.25] font-extrabold text-[#1e293b] text-balance">
            Hành trình “bóc tách” bản thân
          </h2>
          <p className="mt-2 text-sm leading-[1.6] text-[#475569]">
            Không có đáp án đúng sai, chỉ có đáp án thật lòng.
          </p>
        </header>

        <ol
          ref={trackRef}
          tabIndex={0}
          aria-label="4 phần của bài test, vuốt ngang để xem"
          onScroll={() => window.requestAnimationFrame(syncActive)}
          onPointerDown={(e) => {
            pressRef.current = { x: e.clientX, y: e.clientY, scroll: e.currentTarget.scrollLeft };
          }}
          className="relative mt-5 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-6 px-6 pt-1.5 pb-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-[#ec4899] focus-visible:-outline-offset-2 rounded-xl"
        >
          {PART_THEMES.map((t, i) => (
            <li
              key={t.letters.join("")}
              className="flex-[0_0_40%] md:flex-[0_0_calc((100%-36px)/4)] snap-start flex"
            >
              <article
                aria-labelledby={`pd-qp-${i}`}
                className="relative w-full flex flex-col p-2 rounded-[18px] cursor-pointer transition-transform duration-150 hover:-translate-y-1 active:scale-[.97] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
                style={{ backgroundColor: t.bg, boxShadow: `0 0 0 1px ${t.ring}, 0 4px 10px rgba(148,163,184,.16)` }}
              >
                <div className="aspect-square rounded-[14px] overflow-hidden flex items-end justify-center" style={{ background: t.well }}>
                  <img src={srcOf(t.mascot)} alt="" className="h-[80%] w-auto object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,.12)]" />
                </div>
                <span className="mt-2 text-[11px] font-semibold" style={{ color: t.chip }}>
                  Phần {i + 1} · Câu {i * PART_SIZE + 1}–{(i + 1) * PART_SIZE}
                </span>
                <p className="mt-1 flex items-center gap-1 text-[13px] font-extrabold" style={{ color: t.chip }}>
                  <span className="sr-only">Cặp tính cách:</span>
                  {t.letters.map((letter, k) => (
                    <span key={letter} className="contents">
                      {k === 1 && (
                        <>
                          <span aria-hidden className="text-[#94a3b8] font-normal">↔</span>
                          <span className="sr-only">hoặc</span>
                        </>
                      )}
                      <b>{letter}</b>
                      <span className="sr-only">{t.poleNames[k]}</span>
                    </span>
                  ))}
                </p>
                <h3 id={`pd-qp-${i}`} className="mt-1 text-[13px] leading-[1.35] font-bold text-[#1e293b] text-pretty">
                  {/* Stretched button: its ::after covers the whole card, so
                      the card is one tap target with the title as its name. */}
                  <button
                    type="button"
                    onClick={onCardClick}
                    className="text-left cursor-pointer after:absolute after:inset-0 after:rounded-[18px] after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#ec4899]"
                  >
                    {CARDS[i]!.title}
                  </button>
                </h3>
              </article>
            </li>
          ))}
        </ol>

        <div role="group" aria-label="Chọn phần" className="flex justify-center md:hidden">
          {PART_THEMES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Phần ${i + 1}`}
              aria-current={i === active ? "true" : "false"}
              onClick={() => goTo(i)}
              className="p-2 focus-visible:outline-2 focus-visible:outline-[#ec4899] rounded-full"
            >
              <span
                className={`block h-2 rounded-full transition-all motion-reduce:transition-none ${i === active ? "w-[22px] bg-[#ec4899]" : "w-2 bg-[#e2c8d6]"}`}
              />
            </button>
          ))}
        </div>
        <p aria-hidden className="mt-1 text-center text-xs text-[#94a3b8] md:hidden">
          Vuốt ngang để xem cả 4 phần →
        </p>

        <div className="mt-6 px-6 max-w-[600px] mx-auto">
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-full py-4 px-6 text-[17px] font-bold text-white bg-[linear-gradient(90deg,#ec4899,#fb7185)] shadow-[0_10px_20px_-6px_rgba(236,72,153,.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f9a8d4]"
          >
            Làm bài test ngay
          </button>
        </div>
      </div>
    </section>
  );
}
