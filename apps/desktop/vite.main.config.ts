import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["es"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        "electron",
        /^node:/,
        "better-sqlite3",
        "knex",
      ],
    },
    minify: false,
    emptyOutDir: false,
  },
});
