import { Router } from "express";
import { CreateCollectionInputSchema, IdParamSchema } from "@repo/types";
import domain from "@repo/domain";

export const collectionsRouter = Router();

collectionsRouter.get("/", async (_req, res) => {
  const collections = await domain.collections.list();
  res.json(collections);
});

collectionsRouter.post("/", async (req, res) => {
  const result = CreateCollectionInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const collection = await domain.collections.create(result.data.name.trim());
  res.status(201).json(collection);
});

collectionsRouter.delete("/:id", async (req, res) => {
  const result = IdParamSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await domain.collections.remove(result.data.id);
  if (!deleted) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  res.status(204).send();
});

collectionsRouter.post("/:id/default", async (req, res) => {
  const result = IdParamSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const success = await domain.collections.setDefault(result.data.id);
  if (!success) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  const collections = await domain.collections.list();
  res.json(collections);
});
