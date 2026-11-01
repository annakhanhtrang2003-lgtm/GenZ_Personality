import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Static link preview for invite links (spec §4.4, Q7): built once at build
 * time, no request data, so it never shows a name or a score.
 */
export const alt = "Hai đứa hợp nhau tới đâu? 💞";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HERO = join(process.cwd(), "app/personal-definition/_assets/og/hero.png");

export default async function Image() {
  const hero = `data:image/png;base64,${(await readFile(HERO)).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          gap: 48,
          background: "linear-gradient(135deg, #fbcfe8 0%, #f5d0fe 50%, #ddd6fe 100%)",
        }}
      >
        {/* 281×420 source (PNG: Satori cannot decode webp) */}
        <img src={hero} width={300} height={448} />

        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
          <div style={{ fontSize: 68, fontWeight: 800, color: "#1e293b", lineHeight: 1.15 }}>
            Hai đứa hợp nhau tới đâu? 💞
          </div>
          <div style={{ fontSize: 36, color: "#475569" }}>Làm test 3 phút, xem độ hợp ngay</div>
        </div>
      </div>
    ),
    size,
  );
}
