import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khám phá bản thân",
  description: "Bài test tính cách MBTI 40 câu cho sinh viên — kèm cung hoàng đạo và thần số học.",
};

// viewport-fit=cover makes env(safe-area-inset-*) non-zero on notched
// iPhones — the sticky CTA pads itself above the home indicator with it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
