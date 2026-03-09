import path from "node:path";
import express from "express";
import cors from "cors";
import { initDatabase } from "@repo/repository";
import { notesRouter } from "./routes/notes";
import { tagsRouter } from "./routes/tags";
import { errorHandler } from "./middleware/errorHandler";
import { seedDatabase } from "./seed";

const PORT = process.env.PORT ?? 3001;
const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "astronote.db");

async function main() {
  await initDatabase(DB_PATH);
  seedDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/notes", notesRouter);
  app.use("/api/tags", tagsRouter);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

main();
