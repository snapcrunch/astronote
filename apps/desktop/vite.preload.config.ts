import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/preload.ts"),
      formats: ["cjs"],
      fileName: () => "preload.cjs",
    },
    rollupOptions: {
      external: ["electron"],
    },
    minify: false,
    emptyOutDir: false,
  },
});
