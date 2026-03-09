import { Router } from "express";
import * as domain from "@repo/domain";
import { SettingsSchema } from "@repo/types";

export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res) => {
  const settings = await domain.getSettings();
  res.json(settings);
});

settingsRouter.patch("/", async (req, res) => {
  const result = SettingsSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const settings = await domain.updateSettings(result.data);
  res.json(settings);
});

settingsRouter.post("/reset", async (_req, res) => {
  const defaultCollection = await domain.resetAll();
  res.json(defaultCollection);
});
