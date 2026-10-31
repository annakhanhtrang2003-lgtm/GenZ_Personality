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

