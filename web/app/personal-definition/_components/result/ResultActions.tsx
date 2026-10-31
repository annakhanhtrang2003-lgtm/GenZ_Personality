"use client";

import { useState } from "react";
import type { PersonalProfile } from "../../_lib/types";
import { renderShareImage, shareFileName } from "../../_lib/shareImage";

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

/**
 * The result screen's last block: one "Chia sẻ kết quả" button (Web Share
 * with the image file where supported, otherwise the image downloads as
 * name_mbti_number.png). Plugs into SynthesisView's `actions` slot.
 */
export function ResultActions({ profile, accent }: { profile: PersonalProfile; accent: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const type = profile.mbti.type;
  const filename = shareFileName(profile.user.name, type, profile.numerology.life_path);

  // One button: the share sheet with the image where the browser can share
  // files (phones), otherwise the image is downloaded (most desktops).
  const onShare = async () => {
    setBusy(true);
    setStatus("");
    try {
      const blob = await renderShareImage(profile);
      const file = new File([blob], filename, { type: "image/png" });
      const data: ShareData = {
        files: [file],
        title: `Mình là ${type}`,
        text: `Mình là ${type}, ${profile.mbti.label}. Còn bạn là ai? ${window.location.origin}/personal-definition`,
      };
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share(data);
      } else {
        downloadBlob(blob, filename);
        setStatus("Đã tải ảnh về máy, đăng story khoe liền nha!");
      }
    } catch (err) {
      // Closing the share sheet is not an error worth a message.
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setStatus("Chưa tạo được ảnh, bạn thử lại nhé.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onShare}
        disabled={busy}
        className="w-full rounded-full py-4 px-4 text-[16px] font-bold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: accent, outlineColor: accent }}
      >
        {busy ? "Đang tạo ảnh…" : "Chia sẻ kết quả"}
      </button>

      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-[#475569]">
        {status}
      </p>
    </section>
  );
}
