import { spawn } from "node:child_process";
import { build } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(root, "..");

async function start() {
  // Build main and preload
  await build({
    configFile: path.join(desktopRoot, "vite.main.config.ts"),
    mode: "development",
  });
  await build({
    configFile: path.join(desktopRoot, "vite.preload.config.ts"),
    mode: "development",
  });

  // Launch Electron pointing at the Vite dev server
  const electronPath = path.join(desktopRoot, "node_modules", ".bin", "electron");
  const child = spawn(electronPath, [path.join(desktopRoot, "dist", "main.js")], {
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: "http://localhost:5173",
    },
  });

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
}

start();
