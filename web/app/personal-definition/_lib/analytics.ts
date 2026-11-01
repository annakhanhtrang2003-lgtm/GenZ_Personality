import type { TierId } from "./compat";

export type CompatEvent =
  | "compat_invite_create"
  | "compat_invite_open"
  | "compat_partial_view"
  | "compat_test_start"
  | "compat_full_view"
  | "compat_share_click"
  | "compat_share_success";

/** The only props allowed. Never a name, birth date, school or answer. */
export interface CompatEventProps {
  tier?: TierId;
  format?: "story" | "square";
  hidden_name?: boolean;
}

/** No-op until an analytics tool is chosen (spec §7 Q8). */
export function track(_event: CompatEvent, _props?: CompatEventProps): void {}
