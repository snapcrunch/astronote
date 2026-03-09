import { Router } from "express";
import * as domain from "@repo/domain";

export const tagsRouter = Router();

tagsRouter.get("/", async (_req, res) => {
  const tags = await domain.listTags();
  res.json(tags);
});
