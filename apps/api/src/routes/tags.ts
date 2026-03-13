import { Router } from "express";
import * as domain from "@repo/domain";

export const tagsRouter = Router();

tagsRouter.get("/", async (req, res) => {
  const collectionId = req.query.collectionId ? Number(req.query.collectionId) : undefined;
  const tags = await domain.listTags(collectionId);
  res.json(tags);
});
