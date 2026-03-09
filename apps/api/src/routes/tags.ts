import { Router } from "express";
import * as domain from "@repo/domain";

export const tagsRouter = Router();

tagsRouter.get("/", (_req, res) => {
  const tags = domain.listTags();
  res.json(tags);
});
