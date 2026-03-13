import { Router } from "express";
import domain from "@repo/domain";

export const tagsRouter = Router();

tagsRouter.get("/", async (req, res) => {
  const collectionId = req.query.collectionId ? Number(req.query.collectionId) : undefined;
  const tags = await domain.tags.list(collectionId);
  res.json(tags);
});
