import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Mirrors the `@/` path alias from tsconfig.json so tests import the same way app code does.
export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
