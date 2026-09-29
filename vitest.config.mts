import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.{ts,tsx}"],
    // GitHub and Vercel runners have two cores. Matching that capacity keeps
    // concurrent jsdom renders from starving otherwise fast component tests.
    maxWorkers: 2,
  },
});
