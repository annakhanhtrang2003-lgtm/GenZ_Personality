import type { CompatPerson, CompatResult } from "./compat";
import { poseForType, srcOf } from "./mascot";
import { FONT, INK, MUTED, fitText, loadImage, roundRect, safeFileName } from "./shareImage";

/** "Hợp nhau" couple card (spec §4.3): Story 9:16 and Square 1:1. No birth date, ever. */
export type CompatFormat = "story" | "square";

export const FORMAT_SIZE: Record<CompatFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
};

export interface CompatCardModel {
  left: string;
  right: string;
  leftType: string;
  rightType: string;
  total: number;
  tierLabel: string;
  bars: { label: string; score: number }[];
  match: string;
  footer: string;
  accent: string;
  tint: string;
}

type Typed = CompatPerson & { type: string };

export function compatCardModel(
  r: CompatResult,
  left: Typed,
  right: Typed,
  nameLeft: string | null,
  nameRight: string | null,
  host: string,
  colors: { accent: string; tint: string },
): CompatCardModel {
  return {
    left: nameLeft ?? "Bạn ấy",
    right: nameRight ?? "Bạn ấy",
    leftType: left.type,
    rightType: right.type,
    total: r.total ?? 0,
    tierLabel: r.tier?.label ?? "",
    bars: [
      ...(r.personality ? [{ label: "Tính cách", score: r.personality.score }] : []),
      { label: "Cung", score: r.zodiac.score },
      { label: "Số Chủ Đạo", score: r.lifePath.score },
    ],
    match: r.personality?.lines.match ?? r.zodiac.lines.match,
    footer: `Còn bạn hợp với ai? Thử tại ${host}`,
    accent: colors.accent,
    tint: colors.tint,
  };
}

export function compatFileName(nameLeft: string | null, nameRight: string | null, total: number): string {
  return `${safeFileName(nameLeft, "ban-ay")}-x-${safeFileName(nameRight, "ban-ay")}_${total}.png`;
}

/** Vertical positions per format; the square card is the same stack, tighter. */
const LAYOUT = {
  story: { head: 150, names: 240, mTop: 300, mH: 420, total: 1000, totalPx: 230, tier: 1100, bars: 1210, step: 112, match: 1610, matchLines: 2, matchPx: 34, lineH: 48 },
  square: { head: 80, names: 150, mTop: 180, mH: 250, total: 560, totalPx: 150, tier: 640, bars: 700, step: 74, match: 950, matchLines: 2, matchPx: 30, lineH: 40 },
} as const;

/** Up to `max` lines, the last one ellipsised if the text still overflows. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  kept[max - 1] = fitText(ctx, `${kept[max - 1]} ${lines.slice(max).join(" ")}`, maxWidth);
  return kept;
}

type Img = { img: CanvasImageSource; w: number; h: number } | null;

export function drawCompatCard(ctx: CanvasRenderingContext2D, m: CompatCardModel, format: CompatFormat, mascots: [Img, Img]) {
  const { w: W, h: H } = FORMAT_SIZE[format];
  const L = LAYOUT[format];
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = m.tint;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = m.accent;
  ctx.beginPath();
  ctx.arc(W - 80, 120, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(60, H - 160, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = MUTED;
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText("Hai đứa hợp nhau tới đâu?", W / 2, L.head);
  ctx.fillStyle = INK;
  ctx.font = `800 56px ${FONT}`;
  ctx.fillText(fitText(ctx, `${m.left} × ${m.right}`, W - 120), W / 2, L.names);

  // Two mascots, one per half, bottom-aligned, with an × between.
  mascots.forEach((mm, i) => {
    if (!mm) return;
    const boxW = W / 2 - 90;
    const s = Math.min(L.mH / mm.h, boxW / mm.w, 1.4);
    const w = mm.w * s;
    const h = mm.h * s;
    const cx = i === 0 ? W / 4 + 20 : (3 * W) / 4 - 20;
    ctx.drawImage(mm.img, cx - w / 2, L.mTop + L.mH - h, w, h);
  });
  ctx.fillStyle = m.accent;
  ctx.font = `800 64px ${FONT}`;
  ctx.fillText("×", W / 2, L.mTop + L.mH / 2 + 20);

  ctx.font = `900 ${L.totalPx}px ${FONT}`;
  ctx.fillText(String(m.total), W / 2, L.total);
  ctx.font = `800 56px ${FONT}`;
  ctx.fillText(fitText(ctx, m.tierLabel, W - 120), W / 2, L.tier);

  const bx = 130;
  const bw = W - 2 * bx;
  m.bars.forEach((b, i) => {
    const y = L.bars + i * L.step;
    ctx.font = `700 32px ${FONT}`;
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.fillText(b.label, bx, y);
    ctx.fillStyle = m.accent;
    ctx.textAlign = "right";
    ctx.fillText(String(b.score), bx + bw, y);
    ctx.textAlign = "center";
    roundRect(ctx, bx, y + 18, bw, 16, 8);
    ctx.fillStyle = "#e2e8f0";
    ctx.fill();
    roundRect(ctx, bx, y + 18, (bw * Math.max(0, Math.min(100, b.score))) / 100, 16, 8);
    ctx.fillStyle = m.accent;
    ctx.fill();
  });

  ctx.fillStyle = INK;
  ctx.font = `500 ${L.matchPx}px ${FONT}`;
  wrap(ctx, `💞 ${m.match}`, W - 200, L.matchLines).forEach((line, i) => {
    ctx.fillText(line, W / 2, L.match + i * L.lineH);
  });

  ctx.fillStyle = MUTED;
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText(fitText(ctx, m.footer, W - 120), W / 2, H - 40);
}

async function mascot(type: string): Promise<Img> {
  const img = await loadImage(srcOf(poseForType(type))).catch(() => null);
  return img ? { img, w: img.naturalWidth, h: img.naturalHeight } : null;
}

/** Renders the couple card as a PNG blob in the browser. */
export async function renderCompatImage(m: CompatCardModel, format: CompatFormat): Promise<Blob> {
  const { w, h } = FORMAT_SIZE[format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("compatShareImage: canvas 2D is not available");
  await document.fonts?.ready;
  const imgs = await Promise.all([mascot(m.leftType), mascot(m.rightType)]);
  drawCompatCard(ctx, m, format, imgs);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("compatShareImage: toBlob failed"))), "image/png"),
  );
}
