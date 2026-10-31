"use client";

import { useState } from "react";
import type { PersonalProfile } from "../../_lib/types";
import { renderShareImage, shareFileName } from "../../_lib/shareImage";
import { CAREERPATH_URL, careerPathUrl } from "../../_lib/links";

type Busy = "share" | "download" | null;

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
 * The result screen's last block: share the result image (Web Share with a
 * file where the browser supports it, otherwise it downloads), download it,
 * and the way on to CareerPath. Plugs into SynthesisView's `actions` slot.
 */
export function ResultActions({ profile, accent }: { profile: PersonalProfile; accent: string }) {
  const [busy, setBusy] = useState<Busy>(null);
  const [status, setStatus] = useState("");
  const type = profile.mbti.type;
  const filename = shareFileName(type);

  const makeImage = async () => renderShareImage(profile);

  const onDownload = async () => {
    setBusy("download");
    setStatus("");
    try {
      downloadBlob(await makeImage(), filename);
      setStatus("Đã lưu ảnh, đăng story khoe liền nha!");
    } catch {
      setStatus("Chưa tạo được ảnh, bạn thử lại nhé.");
    } finally {
      setBusy(null);
    }
  };

  const onShare = async () => {
    setBusy("share");
    setStatus("");
    try {
      const blob = await makeImage();
      const file = new File([blob], filename, { type: "image/png" });
      const data: ShareData = {
        files: [file],
        title: `Mình là ${type}`,
        text: `Mình là ${type}, ${profile.mbti.label}. Còn bạn là ai? ${window.location.origin}/personal-definition`,
      };
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share(data);
      } else {
        // No file sharing here (most desktop browsers): save the image instead.
        downloadBlob(blob, filename);
        setStatus("Máy bạn chưa hỗ trợ chia sẻ ảnh, mình đã tải ảnh về cho bạn.");
      }
    } catch (err) {
      // Closing the share sheet is not an error worth a message.
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setStatus("Chưa chia sẻ được, bạn thử tải ảnh về nhé.");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onShare}
          disabled={busy !== null}
          className="rounded-full py-3.5 px-4 text-[15px] font-bold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: accent, outlineColor: accent }}
        >
          {busy === "share" ? "Đang tạo ảnh…" : "Chia sẻ kết quả"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy !== null}
          className="rounded-full py-3.5 px-4 text-[15px] font-bold bg-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: accent, boxShadow: `inset 0 0 0 2px ${accent}`, outlineColor: accent }}
        >
          {busy === "download" ? "Đang tạo ảnh…" : "Tải ảnh về"}
        </button>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-[#475569]">
        {status}
      </p>

      <a
        href={careerPathUrl(CAREERPATH_URL, profile)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-[20px] bg-[#0f172a] px-4 py-4 text-[15px] font-bold whitespace-nowrap text-white shadow-[0_10px_22px_-8px_rgba(15,23,42,.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f172a]"
      >
        Khám phá lộ trình nghề nghiệp phù hợp
        <span aria-hidden>→</span>
      </a>
    </section>
  );
}
