import { Router } from "express";
import { ListTagsQuerySchema } from "@repo/types";
import domain from "@repo/domain";

export const tagsRouter = Router();

tagsRouter.get("/", async (req, res) => {
  const result = ListTagsQuerySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const tags = await domain.tags.list(result.data.collectionId);
  res.json(tags);
});
