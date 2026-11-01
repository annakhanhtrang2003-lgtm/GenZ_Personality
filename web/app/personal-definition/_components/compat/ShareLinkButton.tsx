"use client";

import { useState } from "react";

export type ShareOutcome = "shared" | "copied" | "manual" | "cancelled";

/** Web Share if available; else copy to clipboard; else hand back for manual copy. */
export async function shareOrCopy(url: string, text: string): Promise<ShareOutcome> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ url, text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Any other share failure falls through to the clipboard.
    }
  }
  try {
    if (!navigator.clipboard?.writeText) return "manual";
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "manual";
  }
}

/** One share button plus its status line (copied note, or a box to copy by hand). */
export function ShareLinkButton({ label, accent, primary, build, onDone }: {
  label: string;
  accent: string;
  primary: boolean;
  build: () => { url: string; text: string };
  onDone?: (outcome: ShareOutcome) => void;
}) {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  const [manualUrl, setManualUrl] = useState("");

  const onClick = async () => {
    const { url, text } = build();
    const got = await shareOrCopy(url, text);
    setManualUrl(got === "manual" ? url : "");
    setOutcome(got);
    onDone?.(got);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-full py-4 px-4 text-[16px] font-bold border-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={
          primary
            ? { backgroundColor: accent, borderColor: accent, color: "#fff", outlineColor: accent }
            : { backgroundColor: "#fff", borderColor: accent, color: accent, outlineColor: accent }
        }
      >
        {label}
      </button>
      <div role="status" aria-live="polite" className="min-h-5 text-center text-sm text-[#475569]">
        {outcome === "copied" && "Đã copy link, dán cho bạn bè nha!"}
        {outcome === "manual" && (
          <div className="flex flex-col gap-1 text-left">
            <input
              readOnly
              value={manualUrl}
              aria-label="Link mời"
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-xl border border-worker-border px-3 py-2 text-[13px] text-[#1e293b]"
            />
            <span className="text-xs text-[#64748b]">Bấm giữ để copy link</span>
          </div>
        )}
      </div>
    </div>
  );
}
