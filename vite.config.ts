import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: isSsrBuild
    ? {
        outDir: "dist-ssr",
        // Two entries: the page renderer, and the business facts for the structured data.
        rollupOptions: { input: { "entry-server": "src/entry-server.tsx", business: "src/data/business.ts" }, output: { entryFileNames: "[name].js" } },
      }
    : {},
}));
