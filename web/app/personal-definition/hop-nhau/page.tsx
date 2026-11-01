import { Suspense } from "react";
import type { Metadata } from "next";
import { HopNhauScreen } from "../_components/compat/HopNhauScreen";

export const metadata: Metadata = {
  title: "Hai đứa hợp nhau tới đâu? 💞",
  description: "Làm bài test tính cách và xem độ hợp với bạn bè.",
};

/**
 * Static route. The invite lives in `?i=` (read on the client via
 * useSearchParams, hence the Suspense boundary) and the name after `#`.
 */
export default function HopNhauPage() {
  return (
    <Suspense fallback={null}>
      <HopNhauScreen />
    </Suspense>
  );
}
