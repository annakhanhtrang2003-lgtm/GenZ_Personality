"use client";

import { useState } from "react";
import type { PersonalProfile } from "../../_lib/types";
import {
  buildInviteUrl, buildPairUrl, cleanName, encodeInvite, inviteFromProfile,
} from "../../_lib/inviteCode";
import { track } from "../../_lib/analytics";
import { TEMPERAMENTS, temperamentOf } from "../../_lib/temperament";
import { ShareLinkButton } from "./ShareLinkButton";
import { QuickCompat } from "./QuickCompat";

export { shareOrCopy, type ShareOutcome } from "./ShareLinkButton";

/**
 * "Hợp nhau" invite (spec §3 A1): shares a link carrying this profile's
 * type, sign and life path, with the display name after `#` unless hidden.
 */
export function InviteBlock({ profile, accent, label = "Xem bạn hợp với ai 💞", showQuick = true }: {
  profile: PersonalProfile;
  accent: string;
  label?: string;
  /** The A4 quick-mode toggle; off on the compare screen's "Mời người khác". */
  showQuick?: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const [quick, setQuick] = useState(false);
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
      {showQuick && (
        <button
          type="button"
          aria-expanded={quick}
          onClick={() => setQuick((q) => !q)}
          className="self-center min-h-11 text-sm font-semibold underline underline-offset-4"
          style={{ color: accent }}
        >
          Hoặc thử nhanh với ngày sinh của bạn bè
        </button>
      )}
      {showQuick && quick && <QuickCompat me={profile} accent={accent} hideName={hidden} />}
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
