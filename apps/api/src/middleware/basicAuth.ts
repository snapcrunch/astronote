import type { Request, Response, NextFunction } from "express";
import { getSettings } from "@repo/repository";

export async function basicAuth(req: Request, res: Response, next: NextFunction) {
  const settings = await getSettings();

  if (settings.auth_method !== "basic") {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Astronote"');
    res.status(401).send("Authentication required");
    return;
  }

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const [username, ...rest] = decoded.split(":");
  const password = rest.join(":");

  if (username === settings.auth_username && password === settings.auth_password) {
    next();
  } else {
    res.setHeader("WWW-Authenticate", 'Basic realm="Astronote"');
    res.status(401).send("Invalid credentials");
  }
}
