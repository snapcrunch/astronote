import type { AstronoteClient } from "@repo/astronote-client/AstronoteClient";
import { WebClient } from "@repo/astronote-client/WebClient";

let client: AstronoteClient | null = null;

export function setClient(c: AstronoteClient): void {
  client = c;
}

export function getClient(): AstronoteClient {
  if (!client) {
    client = new WebClient();
  }
  return client;
}
