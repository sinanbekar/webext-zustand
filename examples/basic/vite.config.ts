import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest";

export default defineConfig({
  // @see https://github.com/crxjs/chrome-extension-tools/issues/696
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  // prevent src/ prefix on extension urls
  root: resolve(__dirname, "src"),
  build: {
    outDir: resolve(__dirname, "dist"),
  },
  plugins: [react(), crx({ manifest })],
});
