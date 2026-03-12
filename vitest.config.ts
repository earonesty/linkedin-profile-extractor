import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["tests/parser/**/*.test.ts", "packages/*/src/**/*.test.ts"],
    exclude: ["tests/playwright/**", "tests/manual/**"],
    globals: true,
  },
  resolve: {
    alias: {
      "@liex/schema": path.resolve(__dirname, "packages/schema/src"),
      "@liex/extractor-core": path.resolve(
        __dirname,
        "packages/extractor-core/src"
      ),
      "@liex/extractor-linkedin": path.resolve(
        __dirname,
        "packages/extractor-linkedin/src"
      ),
      "@liex/ui-overlay": path.resolve(__dirname, "packages/ui-overlay/src"),
      "@liex/transport-download": path.resolve(
        __dirname,
        "packages/transport-download/src"
      ),
      "@liex/transport-clipboard": path.resolve(
        __dirname,
        "packages/transport-clipboard/src"
      ),
      "@liex/transport-webhook": path.resolve(
        __dirname,
        "packages/transport-webhook/src"
      ),
    },
  },
});
