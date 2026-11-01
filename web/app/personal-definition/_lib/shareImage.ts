import type { PersonalProfile } from "./types";
import { temperamentOf, TEMPERAMENTS } from "./temperament";
import { dominantPole, POLE_NAMES } from "./poles";
import { poseForType, srcOf } from "./mascot";

/** 4:5 — the tallest ratio Instagram/Facebook feeds accept uncropped. */
export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1350;

const DIMENSIONS = ["EI", "SN", "TF", "JP"] as const;
const POLES: Record<(typeof DIMENSIONS)[number], [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

export interface ShareBar {
  left: string;
  right: string;
  winnerPole: string;
  winnerName: string;
  percent: number;
  /** 0 = far left (first pole), 100 = far right — same rule as DimensionBreakdown. */
  markerPct: number;
}

export interface ShareModel {
  type: string;
  label: string;
  name: string;
  temperamentName: string;
  accent: string;
  tint: string;
  bars: ShareBar[];
  footer: string;
}

/**
 * Everything the image shows, as plain data (testable without a canvas).
 * Display name only; the birth date never reaches the image.
 */
export function shareModel(profile: PersonalProfile, host: string): ShareModel {
  const { mbti, user } = profile;
  const temp = TEMPERAMENTS[temperamentOf(mbti.type)];
  const bars = DIMENSIONS.map((d) => {
    const score = mbti.dimensions[d];
    const win = dominantPole(d, score);
    const [l, r] = POLES[d];
    return {
      left: POLE_NAMES[l]!,
      right: POLE_NAMES[r]!,
      winnerPole: win.pole,
      winnerName: win.name,
      percent: Math.round(win.percent),
      markerPct: Math.min(100, Math.max(0, 100 - score.first)),
    };
  });
  return {
    type: mbti.type,
    label: mbti.label,
    name: user.name,
    temperamentName: temp.name,
    accent: temp.accent,
    tint: temp.tint,
    bars,
    footer: `Còn bạn là ai? Làm test tại ${host}`,
  };
}

/**
 * File-safe name: accents and đ folded, anything but letters/digits becomes a
 * hyphen; a name with nothing left (or null) becomes `fallback`. Shared by the
 * solo card and the couple card so both name files the same way.
 */
export function safeFileName(name: string | null, fallback = "ban"): string {
  return (
    (name ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

/** `name_mbti_number.png`, e.g. "Khanh-Trang_ENTJ_4.png". */
export function shareFileName(name: string, type: string, lifePath: number): string {
  return `${safeFileName(name)}_${type}_${lifePath}.png`;
}

export const FONT = '"MoMo Trust", "SF Pro Rounded", -apple-system, "Segoe UI", Roboto, sans-serif';
export const INK = "#1e293b";
export const MUTED = "#475569";

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  return t + "…";
}

/** Paints the share card. Pure drawing — no DOM reads beyond the context. */
export function drawShareCard(ctx: CanvasRenderingContext2D, m: ShareModel, mascot: CanvasImageSource | null, mascotSize?: { w: number; h: number }) {
  const W = SHARE_WIDTH;
  const H = SHARE_HEIGHT;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Background: temperament tint with two soft accent blobs.
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

  // Header.
  ctx.fillStyle = MUTED;
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText("Kết quả bài test tính cách của", W / 2, 96);
  ctx.fillStyle = INK;
  ctx.font = `800 50px ${FONT}`;
  ctx.fillText(fitText(ctx, m.name, 900), W / 2, 160);

  // Mascot card.
  const cx = 230, cy = 200, cw = 620, ch = 470;
  ctx.save();
  ctx.shadowColor = "rgba(15,23,42,.12)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, cx, cy, cw, ch, 48);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 6;
  ctx.strokeStyle = m.accent;
  roundRect(ctx, cx, cy, cw, ch, 48);
  ctx.stroke();
  if (mascot && mascotSize) {
    const maxH = ch - 50;
    const maxW = cw - 60;
    const s = Math.min(maxH / mascotSize.h, maxW / mascotSize.w, 1);
    const w = mascotSize.w * s;
    const h = mascotSize.h * s;
    ctx.drawImage(mascot, cx + (cw - w) / 2, cy + ch - h - 20, w, h);
  }

  // Temperament pill.
  ctx.font = `800 26px ${FONT}`;
  const pill = m.temperamentName.toUpperCase();
  const pw = ctx.measureText(pill).width + 56;
  roundRect(ctx, (W - pw) / 2, 700, pw, 52, 26);
  ctx.fillStyle = m.accent;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(pill, W / 2, 736);

  // Type + nickname.
  ctx.fillStyle = m.accent;
  ctx.font = `900 150px ${FONT}`;
  ctx.fillText(m.type, W / 2, 900);
  ctx.fillStyle = INK;
  ctx.font = `700 44px ${FONT}`;
  ctx.fillText(fitText(ctx, m.label, 960), W / 2, 966);

  // Four bars.
  const bx = 130, bw = W - 2 * bx;
  m.bars.forEach((b, i) => {
    const y = 1030 + i * 64;
    const leftWins = b.winnerName === b.left;
    ctx.font = `${leftWins ? 800 : 500} 26px ${FONT}`;
    ctx.fillStyle = leftWins ? m.accent : MUTED;
    ctx.textAlign = "left";
    ctx.fillText(leftWins ? `${b.left} ${b.percent}%` : b.left, bx, y);
    ctx.font = `${leftWins ? 500 : 800} 26px ${FONT}`;
    ctx.fillStyle = leftWins ? MUTED : m.accent;
    ctx.textAlign = "right";
    ctx.fillText(leftWins ? b.right : `${b.right} ${b.percent}%`, bx + bw, y);
    ctx.textAlign = "center";
    roundRect(ctx, bx, y + 12, bw, 12, 6);
    ctx.fillStyle = "#e2e8f0";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx + (bw * b.markerPct) / 100, y + 18, 13, 0, Math.PI * 2);
    ctx.fillStyle = m.accent;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  });

  // Footer.
  ctx.fillStyle = MUTED;
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText(fitText(ctx, m.footer, 960), W / 2, H - 34);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`shareImage: could not load ${src}`));
    img.src = src;
  });
}

/** Renders the result as a PNG blob in the browser. */
export async function renderShareImage(profile: PersonalProfile): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_WIDTH;
  canvas.height = SHARE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("shareImage: canvas 2D is not available");
  await document.fonts?.ready;
  const img = await loadImage(srcOf(poseForType(profile.mbti.type))).catch(() => null);
  drawShareCard(ctx, shareModel(profile, window.location.host), img, img ? { w: img.naturalWidth, h: img.naturalHeight } : undefined);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("shareImage: toBlob failed"))), "image/png"),
  );
}
