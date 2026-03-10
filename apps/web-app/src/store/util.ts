import type { View } from "./types";

export function buildUrl(view: View, selectedNoteId: string | null, showInfoPanel: boolean, settingDefault: boolean): string {
  let path: string;
  if (view === "settings") {
    path = "/settings";
  } else if (selectedNoteId) {
    path = `/notes/${selectedNoteId}`;
  } else {
    path = "/";
  }
  const params = new URLSearchParams();
  if (showInfoPanel !== settingDefault) {
    params.set("info", showInfoPanel ? "1" : "0");
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function parseUrl(): { view: View; selectedNoteId: string | null; showInfoPanel: boolean | null } {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const showInfoPanel = params.has("info") ? params.get("info") !== "0" : null;

  if (path === "/settings") {
    return { view: "settings", selectedNoteId: null, showInfoPanel };
  }

  const noteMatch = path.match(/^\/notes\/(.+)$/);
  if (noteMatch) {
    return { view: "notes", selectedNoteId: noteMatch[1]!, showInfoPanel };
  }

  return { view: "notes", selectedNoteId: null, showInfoPanel };
}
