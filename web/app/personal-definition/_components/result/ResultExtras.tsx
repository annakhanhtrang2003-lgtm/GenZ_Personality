/**
 * Below the share/career actions: a teaser for the upcoming "năm cá nhân"
 * feature. Not clickable until the feature ships.
 */
export function ResultExtras({ accent }: { accent: string }) {
  return (
    <section className="flex flex-col gap-3">
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
