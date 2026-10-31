const REWARD_TEXT = "Chúc mừng bạn đã khám phá bản thân và nhận ngay phần thưởng xịn tại đây";

/**
 * Below the share/career actions: the reward voucher card and a teaser for
 * the upcoming "năm cá nhân" feature. `voucherHref` is null until the
 * campaign link is configured (see _lib/links.ts) — the card still shows,
 * marked as coming, so the layout can be reviewed before launch.
 */
export function ResultExtras({ accent, voucherHref }: { accent: string; voucherHref: string | null }) {
  const rewardInner = (
    <>
      <span aria-hidden className="text-[34px] leading-none">🎁</span>
      <span className="flex-1 text-left">
        <span className="block text-[15px] font-extrabold leading-snug">{REWARD_TEXT}</span>
        {!voucherHref && <span className="block mt-1 text-xs font-medium opacity-90">Link phần thưởng đang được cập nhật</span>}
      </span>
      {voucherHref && <span aria-hidden className="text-xl">→</span>}
    </>
  );
  const rewardClass =
    "flex items-center gap-3 rounded-[22px] px-5 py-4 text-white bg-[linear-gradient(120deg,#ec4899,#f97316)] shadow-[0_12px_24px_-10px_rgba(236,72,153,.55)]";

  return (
    <section className="flex flex-col gap-3">
      {voucherHref ? (
        <a
          data-testid="reward-card"
          href={voucherHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${rewardClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ec4899]`}
        >
          {rewardInner}
        </a>
      ) : (
        <div data-testid="reward-card" aria-disabled="true" className={`${rewardClass} opacity-80`}>
          {rewardInner}
        </div>
      )}

      <div
        data-testid="personal-year-teaser"
        className="flex items-center gap-3 rounded-[22px] bg-white px-5 py-4 border border-dashed"
        style={{ borderColor: `${accent}80` }}
      >
        <span aria-hidden className="text-[28px] leading-none">🔮</span>
        <span className="flex-1 text-left">
          <span className="block text-[15px] font-bold text-[#1e293b]">Xác định năm cá nhân của bạn có gì tại đây</span>
          <span className="block mt-0.5 text-xs text-[#64748b]">Tính năng đang được hoàn thiện, quay lại sớm nha!</span>
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: accent }}
        >
          Sắp ra mắt
        </span>
      </div>
    </section>
  );
}
