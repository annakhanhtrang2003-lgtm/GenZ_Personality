import type { PersonalProfile } from "./types";

/**
 * Where "Khám phá lộ trình nghề nghiệp phù hợp" goes. Inside the team app
 * (merchant_job_board) CareerPath is the sibling route `/careerpath`; the
 * standalone deploy sets NEXT_PUBLIC_CAREERPATH_URL to the team app's
 * absolute /careerpath URL.
 */
export const CAREERPATH_URL = process.env.NEXT_PUBLIC_CAREERPATH_URL || "/careerpath";

/**
 * CareerPath pre-fills its job-title box from `?title=`, so the top career
 * hint goes there; `mbti` rides along for CareerPath to use later. Nothing
 * personal (name, birth date) ever goes in the URL — North Star privacy rule.
 */
export function careerPathUrl(base: string, profile: PersonalProfile): string {
  const params = new URLSearchParams();
  const top = profile.synthesis.career_hints[0];
  if (top) params.set("title", top);
  params.set("mbti", profile.mbti.type);
  return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
}

/**
 * Reward voucher. Both values are set per deploy once the campaign is
 * ready (NEXT_PUBLIC_VOUCHER_URL, NEXT_PUBLIC_VOUCHER_REF_ID). Until the URL
 * is set, the reward card renders in a "coming" state with no link.
 */
export const VOUCHER_URL = process.env.NEXT_PUBLIC_VOUCHER_URL || "";
export const VOUCHER_REF_ID = process.env.NEXT_PUBLIC_VOUCHER_REF_ID || "";

export function voucherUrl(base: string, refId: string): string | null {
  if (!base) return null;
  if (!refId) return base;
  return `${base}${base.includes("?") ? "&" : "?"}refId=${encodeURIComponent(refId)}`;
}
