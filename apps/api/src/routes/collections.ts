import { Router } from "express";
import * as domain from "@repo/domain";

export const collectionsRouter = Router();

collectionsRouter.get("/", async (_req, res) => {
  const collections = await domain.listCollections();
  res.json(collections);
});

collectionsRouter.post("/", async (req, res) => {
  const { name } = req.body;
  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const collection = await domain.createCollection(name.trim());
  res.status(201).json(collection);
});

collectionsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await domain.deleteCollection(id);
  if (!deleted) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  res.status(204).send();
});

collectionsRouter.post("/:id/default", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const success = await domain.setDefaultCollection(id);
  if (!success) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  const collections = await domain.listCollections();
  res.json(collections);
});
