import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Dev-only harness config. The library itself has no build step and no
 * runtime dependencies — this exists purely so the deterministic modules in
 * lib/personal-definition can be exercised by hand in a browser.
 *
 * vitest reads vitest.config.ts, not this file, so the test suite is
 * unaffected.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    open: "/personal-definition",
  },
});
