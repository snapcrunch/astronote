import path from "node:path";
import express from "express";
import cors from "cors";
import { initDatabase, seedDatabase } from "@repo/repository";
import { notesRouter } from "./routes/notes";
import { tagsRouter } from "./routes/tags";
import { collectionsRouter } from "./routes/collections";
import { settingsRouter } from "./routes/settings";
import { claudeAuthRouter } from "./routes/claude-auth";
import { errorHandler } from "./middleware/errorHandler";
import { basicAuth } from "./middleware/basicAuth";

const PORT = process.env.PORT ?? 3009;
const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "astronote.db");

async function main() {
  await initDatabase(DB_PATH);
  await seedDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(basicAuth);

  app.use("/api/notes", notesRouter);
  app.use("/api/tags", tagsRouter);
  app.use("/api/collections", collectionsRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/claude/auth", claudeAuthRouter);
  app.use(errorHandler);

  // Serve built frontend static files
  const staticDir = path.resolve(import.meta.dirname, "../../web-app/dist");
  app.use(express.static(staticDir));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

main();
