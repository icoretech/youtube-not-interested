import { defineConfig } from "vite";

// Bundles the content script into a single IIFE. scripts/assemble.mjs then
// lays out dist/firefox and dist/chrome with their own manifests.
// `vite build --mode debug` keeps the diagnostics reporter (see src/content/debug.ts).
export default defineConfig(({ mode }) => ({
  define: {
    __DEBUG__: JSON.stringify(mode === "debug"),
  },
  build: {
    outDir: "dist/.bundle",
    emptyOutDir: true,
    target: "es2022",
    minify: false,
    rollupOptions: {
      input: {
        content: "src/content/bootstrap.ts",
      },
      output: {
        entryFileNames: "content.js",
        format: "iife",
        name: "YouTubeNotInterestedRightClick",
      },
    },
  },
}));
