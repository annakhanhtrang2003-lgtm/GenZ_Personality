"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { compatResult, type CompatPerson, type FactorLines } from "../../_lib/compat";
import { track } from "../../_lib/analytics";
import { poseForType, srcOf } from "../../_lib/mascot";
import { TEMPERAMENTS, temperamentOf } from "../../_lib/temperament";
import {
  compatCardModel, compatFileName, renderCompatImage, type CompatFormat,
} from "../../_lib/compatShareImage";

type Typed = CompatPerson & { type: string };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "Chia sẻ thẻ của hai đứa" with a Story / Vuông switch (spec §3 B3, §4.3). */
function CoupleShare({ left, right, nameLeft, nameRight, accent, tint }: {
  left: Typed; right: Typed; nameLeft: string | null; nameRight: string | null; accent: string; tint: string;
}) {
  const [format, setFormat] = useState<CompatFormat>("story");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const onShare = async () => {
    setBusy(true);
    setStatus("");
    track("compat_share_click", { format });
    try {
      const r = compatResult(left, right);
      const model = compatCardModel(r, left, right, nameLeft, nameRight, window.location.host, { accent, tint });
      const blob = await renderCompatImage(model, format);
      const filename = compatFileName(nameLeft, nameRight, model.total);
      const file = new File([blob], filename, { type: "image/png" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        track("compat_share_success", { format, ...(r.tier ? { tier: r.tier.id } : {}) });
      } else {
        downloadBlob(blob, filename);
        setStatus("Đã tải ảnh về máy, đăng story khoe liền nha!");
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setStatus("Chưa tạo được ảnh, bạn thử lại nhé.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex justify-center gap-2" role="group" aria-label="Kiểu ảnh">
        {(["story", "square"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={format === f}
            onClick={() => setFormat(f)}
            className="min-h-11 px-5 rounded-full text-sm font-bold border-2"
            style={
              format === f
                ? { backgroundColor: accent, borderColor: accent, color: "#fff" }
                : { backgroundColor: "#fff", borderColor: accent, color: accent }
            }
          >
            {f === "story" ? "Story" : "Vuông"}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onShare}
        disabled={busy}
        className="w-full rounded-full py-4 px-4 text-[16px] font-bold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: accent, outlineColor: accent }}
      >
        {busy ? "Đang tạo ảnh…" : "Chia sẻ thẻ của hai đứa"}
      </button>
      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-[#475569]">
        {status}
      </p>
    </section>
  );
}

const CARD = "bg-white rounded-[24px] shadow-[0_6px_14px_rgba(148,163,184,.18)] px-5 py-5 flex flex-col gap-4";
const COUNT_MS = 900;

/**
 * One labelled score bar. The worker ProgressBar has no aria-label prop, so
 * this mirrors its markup (track token, rounded fill) with an accessible name.
 */
export function ScoreBar({ label, score, accent }: { label: string; score: number; accent: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm font-bold text-[#1e293b]">
        <span>{label}</span>
        <span style={{ color: accent }}>{score}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-2 rounded-full bg-worker-border overflow-hidden"
      >
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: accent }} />
      </div>
    </div>
  );
}

function prefersReducedMotion(): boolean {
  // No matchMedia (old browsers, jsdom): show the final number, never animate.
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Counts 0 → target once; renders the target at once under reduced motion. */
function useCountUp(target: number): number {
  const [n, setN] = useState(() => (prefersReducedMotion() ? target : 0));
  useEffect(() => {
    if (prefersReducedMotion()) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      setN(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return n;
}

function Factor({ label, score, lines, accent, note }: {
  label: string; score: number; lines: FactorLines; accent: string; note?: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ScoreBar label={label} score={score} accent={accent} />
      <p className="text-[14px] leading-relaxed text-[#1e293b]">
        <span className="font-bold">💞 Điểm hợp nhất: </span>
        {lines.match}
      </p>
      <p className="text-[14px] leading-relaxed text-[#334155]">
        <span className="font-bold">⚡ Dễ va chạm: </span>
        {lines.clash}
      </p>
      {note && <p className="text-[13px] italic text-[#475569]">{note}</p>}
    </div>
  );
}

/**
 * Full "Hợp nhau" compare (spec §3 B3). `viewer-is-b`: B just finished the
 * test after opening A's invite. `pair`: anyone opening a ?i=&j= link.
 */
export function CompatView({ a, b, nameA, nameB, mode, actions }: {
  a: Typed;
  b: Typed;
  nameA: string | null;
  nameB: string | null;
  mode: "viewer-is-b" | "pair";
  actions?: ReactNode;
}) {
  const r = compatResult(a, b);
  // Both people have a type here, so every nullable part is filled.
  const total = r.total ?? 0;
  const shown = useCountUp(total);
  const { accent, tint } = TEMPERAMENTS[temperamentOf(mode === "pair" ? a.type : b.type)];

  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !r.tier) return;
    fired.current = true;
    track("compat_full_view", { tier: r.tier.id });
  }, [r.tier]);

  const title =
    mode === "viewer-is-b" ? `Bạn × ${nameA ?? "bạn ấy"}` : `${nameA ?? "Bạn ấy"} × ${nameB ?? "Bạn ấy"}`;
  const [left, right] = mode === "viewer-is-b" ? [b, a] : [a, b];

  return (
    <section data-testid="compat-view" className="px-5 py-8" style={{ backgroundColor: tint }}>
      <div className="max-w-[600px] mx-auto flex flex-col gap-6">
        <header className="flex flex-col items-center text-center gap-2">
          <div className="flex items-end justify-center gap-2">
            <img src={srcOf(poseForType(left.type))} alt="" className="w-[110px] h-[110px] object-contain" />
            <span aria-hidden className="text-2xl font-bold pb-8" style={{ color: accent }}>×</span>
            <img src={srcOf(poseForType(right.type))} alt="" className="w-[110px] h-[110px] object-contain" />
          </div>
          <h2 className="text-[22px] font-bold text-[#1e293b] break-words max-w-full">{title}</h2>
          <p
            data-testid="compat-total"
            className="text-[64px] leading-none font-extrabold tabular-nums"
            style={{ color: accent }}
          >
            {shown}
          </p>
          {r.tier && (
            <>
              <p className="text-xl font-bold" style={{ color: accent }}>{r.tier.label}</p>
              <p className="text-[15px] leading-relaxed text-[#1e293b]">{r.tier.line}</p>
            </>
          )}
        </header>

        <div className={CARD}>
          {r.personality && (
            <Factor label="Tính cách" score={r.personality.score} lines={r.personality.lines} accent={accent} />
          )}
          <Factor label="Cung" score={r.zodiac.score} lines={r.zodiac.lines} accent={accent} />
          <Factor
            label="Số Chủ Đạo"
            score={r.lifePath.score}
            lines={r.lifePath.lines}
            accent={accent}
            note={r.lifePath.masterNote}
          />
        </div>

        {r.activities && (
          <div className={CARD}>
            <h3 className="text-lg font-bold text-[#1e293b]">Hai đứa nên thử cùng nhau</h3>
            <ul className="flex flex-col gap-2">
              {r.activities.map((act) => (
                <li key={act} className="flex gap-2 text-[15px] text-[#1e293b]">
                  <span aria-hidden style={{ color: accent }}>★</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <CoupleShare
          left={left}
          right={right}
          nameLeft={mode === "viewer-is-b" ? nameB : nameA}
          nameRight={mode === "viewer-is-b" ? nameA : nameB}
          accent={accent}
          tint={tint}
        />

        {actions}

        {mode === "viewer-is-b" && (
          <a href="#my-result" className="text-center text-sm font-semibold min-h-11 leading-[44px]" style={{ color: accent }}>
            Xem kết quả đầy đủ của mình ↓
          </a>
        )}
      </div>
    </section>
  );
}
