import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
process.env.MOCK_AI = "true";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.spec.ts"],
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
