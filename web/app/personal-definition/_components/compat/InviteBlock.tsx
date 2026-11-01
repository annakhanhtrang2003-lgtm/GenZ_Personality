"use client";

import { useState } from "react";
import type { PersonalProfile } from "../../_lib/types";
import {
  buildInviteUrl, buildPairUrl, cleanName, encodeInvite, inviteFromProfile,
} from "../../_lib/inviteCode";
import { track } from "../../_lib/analytics";
import { TEMPERAMENTS, temperamentOf } from "../../_lib/temperament";

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
function ShareLinkButton({ label, accent, primary, build, onDone }: {
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

/**
 * "Hợp nhau" invite (spec §3 A1): shares a link carrying this profile's
 * type, sign and life path, with the display name after `#` unless hidden.
 */
export function InviteBlock({ profile, accent, label = "Xem bạn hợp với ai 💞" }: {
  profile: PersonalProfile;
  accent: string;
  label?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const group = TEMPERAMENTS[temperamentOf(profile.mbti.type)].name;

  return (
    <section className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm text-[#475569] min-h-11">
        <input
          type="checkbox"
          checked={hidden}
          onChange={(e) => setHidden(e.target.checked)}
          className="w-5 h-5"
          style={{ accentColor: accent }}
        />
        Ẩn tên của mình trong link
      </label>
      <ShareLinkButton
        label={label}
        accent={accent}
        primary={false}
        build={() => ({
          url: buildInviteUrl(
            window.location.origin,
            encodeInvite(inviteFromProfile(profile)),
            hidden ? null : cleanName(profile.user.name),
          ),
          text: `Mình là ${group} nè, vô xem hai đứa hợp nhau tới đâu 💞`,
        })}
        onDone={(got) => {
          if (got === "shared" || got === "copied") track("compat_invite_create", { hidden_name: hidden });
        }}
      />
    </section>
  );
}

/** "Gửi kết quả cho {A}" (spec Q5): a pair link so A sees the same compare. */
export function SendBackButton({ profile, accent, codeA, nameA }: {
  profile: PersonalProfile;
  accent: string;
  codeA: string;
  nameA: string | null;
}) {
  return (
    <ShareLinkButton
      label={`Gửi kết quả cho ${nameA ?? "bạn ấy"}`}
      accent={accent}
      primary
      build={() => ({
        url: buildPairUrl(
          window.location.origin,
          codeA,
          encodeInvite(inviteFromProfile(profile)),
          nameA,
          cleanName(profile.user.name),
        ),
        text: "Mình làm xong rồi nè, vô xem hai đứa hợp nhau tới đâu 💞",
      })}
    />
  );
}
