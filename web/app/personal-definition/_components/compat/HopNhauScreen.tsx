"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { decodeInvite, personFromBirthDate, personFromInvite, readHashNames } from "../../_lib/inviteCode";
import { compatResult, type CompatPerson } from "../../_lib/compat";
import { track } from "../../_lib/analytics";
import { FACES, poseForType, srcOf } from "../../_lib/mascot";
import { TEMPERAMENTS, temperamentOf } from "../../_lib/temperament";
import { BirthDateSelects } from "../BirthDateSelects";
import { PersonalDefinitionFlow } from "../PersonalDefinitionFlow";

const PAGE = "min-h-[100svh] px-5 pt-6 pb-10 bg-[linear-gradient(180deg,#ffe4e6,#fdf2f8_50%,#ede9fe)]";
const CARD = "bg-white rounded-[24px] shadow-[0_6px_14px_rgba(148,163,184,.18)] px-5 pt-5 pb-6";
const CTA =
  "w-full rounded-full py-4 px-6 text-[17px] font-bold text-white bg-[linear-gradient(90deg,#ec4899,#fb7185)] shadow-[0_10px_20px_-6px_rgba(236,72,153,.45)] disabled:opacity-50 disabled:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f9a8d4]";
const TEST_HOME = "/personal-definition";

/**
 * One labelled score bar. The worker ProgressBar has no aria-label prop, so
 * this mirrors its markup (track token, rounded fill) with an accessible name.
 */
export function ScoreBar({ label, score, accent }: { label: string; score: number; accent: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm font-bold text-[#1e293b]">
        <span>{label}</span>
        <span style={{ color: accent }}>{score}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-2 rounded-full bg-worker-border overflow-hidden"
      >
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: accent }} />
      </div>
    </div>
  );
}

function InviteError() {
  return (
    <div className={PAGE}>
      <div className={`max-w-[440px] mx-auto text-center ${CARD}`}>
        <img src={srcOf(FACES.worried)} alt="" className="w-[96px] h-[96px] object-contain mx-auto mb-3" />
        <h1 className="text-[24px] font-bold text-[#1e293b] mb-2">Link này hơi lạ á 🤔</h1>
        <p className="text-[15px] text-[#475569] mb-6">
          Có thể link bị cắt mất một đoạn. Bạn làm test của mình trước nha, xong rồi rủ lại người gửi.
        </p>
        <a href={TEST_HOME} className={`block ${CTA}`}>
          Làm bài test ngay
        </a>
      </div>
    </div>
  );
}

type Stage = "landing" | "partial" | "test";

/** /personal-definition/hop-nhau: B opens A's invite (spec §3 B1, B2, B-ERR). */
export function HopNhauScreen() {
  const params = useSearchParams();
  const code = params.get("i");
  const payload = useMemo(() => decodeInvite(code), [code]);

  if (!payload || !code) return <InviteError />;
  return <InviteFlow code={code} inviter={personFromInvite(payload)} />;
}

function InviteFlow({ code, inviter }: { code: string; inviter: CompatPerson & { type: string } }) {
  const [stage, setStage] = useState<Stage>("landing");
  const [date, setDate] = useState("");
  // The hash is read after mount so the server render never depends on it.
  const [nameA, setNameA] = useState<string | null>(null);
  const opened = useRef(false);

  useEffect(() => {
    setNameA(readHashNames(window.location.hash).n);
    if (!opened.current) {
      opened.current = true;
      track("compat_invite_open");
    }
  }, []);

  const me = useMemo(() => {
    if (!date) return null;
    try {
      return personFromBirthDate(date);
    } catch {
      return null;
    }
  }, [date]);

  const temperament = TEMPERAMENTS[temperamentOf(inviter.type)];
  const who = nameA ?? "Một người bạn";

  if (stage === "test") {
    return (
      <PersonalDefinitionFlow
        invite={{ person: inviter, code, name: nameA }}
        initialBirthDate={date}
        onExitInvite={() => setStage("partial")}
      />
    );
  }

  if (stage === "partial" && me) {
    const r = compatResult(inviter, me);
    return (
      <div className={PAGE}>
        <div className={`max-w-[440px] mx-auto flex flex-col gap-4 ${CARD}`}>
          <h1 className="text-[22px] font-bold text-[#1e293b] text-center">Hai đứa hợp nhau tới đâu?</h1>
          <ScoreBar label="Cung" score={r.zodiac.score} accent={temperament.accent} />
          <p className="text-[14px] leading-relaxed text-[#334155] -mt-2">{r.zodiac.lines.match}</p>
          <ScoreBar label="Số Chủ Đạo" score={r.lifePath.score} accent={temperament.accent} />
          <p className="text-[14px] leading-relaxed text-[#334155] -mt-2">{r.lifePath.lines.match}</p>
          <div className="rounded-2xl border border-dashed border-worker-border px-4 py-3 text-center">
            <p className="text-sm font-bold text-[#1e293b]">🔒 Nhóm tính cách</p>
            <p className="text-[13px] text-[#475569]">Làm 40 câu để mở khóa 40% còn lại</p>
          </div>
          <p className="text-[15px] font-semibold text-center" style={{ color: temperament.accent }}>
            Điểm tổng của hai đứa sẽ nằm trong khoảng {r.range.min}–{r.range.max}
          </p>
          <button
            type="button"
            className={CTA}
            onClick={() => {
              track("compat_test_start");
              setStage("test");
            }}
          >
            Làm test để mở khóa
          </button>
          <a href={TEST_HOME} className="text-center text-sm font-medium text-[#475569] min-h-11 leading-[44px]">
            Để sau
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE}>
      <div className={`max-w-[440px] mx-auto ${CARD}`}>
        <img
          src={srcOf(poseForType(inviter.type))}
          alt=""
          className="w-[120px] h-[120px] object-contain mx-auto mb-3"
        />
        <h1 className="text-[22px] font-bold text-[#1e293b] text-center mb-2 break-words">
          {who} mời bạn xem hai đứa hợp nhau tới đâu
        </h1>
        <p data-testid="inviter-facts" className="text-sm text-[#475569] text-center mb-6 break-words">
          {nameA ?? "Bạn ấy"} thuộc {temperament.name} · {inviter.sign} · Số Chủ Đạo {inviter.lifePath}
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!me) return;
            track("compat_partial_view");
            setStage("partial");
          }}
        >
          <BirthDateSelects value={date} onChange={setDate} />
          <button type="submit" className={CTA} disabled={!me}>
            Xem độ hợp ngay
          </button>
          <p className="text-xs text-[#64748b] text-center">Không lưu lại, không gửi đi đâu cả.</p>
        </form>
      </div>
    </div>
  );
}
