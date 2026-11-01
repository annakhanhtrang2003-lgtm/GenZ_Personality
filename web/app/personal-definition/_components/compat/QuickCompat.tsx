"use client";

import { useMemo, useState } from "react";
import { TextInput } from "@/components/worker/ui/TextInput";
import type { PersonalProfile } from "../../_lib/types";
import { compatResult } from "../../_lib/compat";
import {
  buildInviteUrl, cleanName, encodeInvite, inviteFromProfile, personFromBirthDate, personFromProfile,
} from "../../_lib/inviteCode";
import { track } from "../../_lib/analytics";
import { TEMPERAMENTS, temperamentOf } from "../../_lib/temperament";
import { BirthDateSelects } from "../BirthDateSelects";
import { ScoreBar } from "./CompatView";
import { ShareLinkButton } from "./ShareLinkButton";

/**
 * A4 quick mode: try a friend's birth date right here. The friend's name and
 * date stay on this device (spec §3 A4): they are never put in the URL, the
 * invite link, or analytics. The invite sent is always the user's own.
 */
export function QuickCompat({ me, accent, hideName = false }: {
  me: PersonalProfile;
  accent: string;
  hideName?: boolean;
}) {
  const [friendName, setFriendName] = useState("");
  const [date, setDate] = useState("");
  const [shown, setShown] = useState(false);

  const friend = useMemo(() => {
    if (!date) return null;
    try {
      return personFromBirthDate(date);
    } catch {
      return null;
    }
  }, [date]);

  const who = cleanName(friendName) ?? "bạn ấy";
  const r = shown && friend ? compatResult(personFromProfile(me), friend) : null;
  const group = TEMPERAMENTS[temperamentOf(me.mbti.type)].name;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white px-4 py-4 shadow-[0_6px_14px_rgba(148,163,184,.18)]">
      <h3 className="text-base font-bold text-[#1e293b]">Thử nhanh với ngày sinh của bạn bè</h3>
      <TextInput
        value={friendName}
        onChange={(v) => {
          setFriendName(v);
          setShown(false);
        }}
        placeholder="Tên bạn ấy (không bắt buộc)"
      />
      <BirthDateSelects
        value={date}
        onChange={(v) => {
          setDate(v);
          setShown(false);
        }}
      />
      <button
        type="button"
        disabled={!friend}
        onClick={() => setShown(true)}
        className="w-full rounded-full py-3 px-4 text-[15px] font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: accent }}
      >
        Xem nhanh
      </button>

      {r && (
        <div className="flex flex-col gap-3">
          <ScoreBar label="Cung" score={r.zodiac.score} accent={accent} />
          <ScoreBar label="Số Chủ Đạo" score={r.lifePath.score} accent={accent} />
          <p className="text-[15px] font-semibold text-center" style={{ color: accent }}>
            Điểm tổng của hai đứa sẽ nằm trong khoảng {r.range.min}–{r.range.max}
          </p>
          <p className="text-sm text-center text-[#475569]">
            Đây mới là 60% thôi, rủ {who} làm test để xem đủ nha
          </p>
          <ShareLinkButton
            label={`Gửi link mời cho ${who}`}
            accent={accent}
            primary
            build={() => ({
              url: buildInviteUrl(
                window.location.origin,
                encodeInvite(inviteFromProfile(me)),
                hideName ? null : cleanName(me.user.name),
              ),
              text: `Mình là ${group} nè, vô xem hai đứa hợp nhau tới đâu 💞`,
            })}
            onDone={(got) => {
              if (got === "shared" || got === "copied") track("compat_invite_create", { hidden_name: hideName });
            }}
          />
        </div>
      )}
    </div>
  );
}
