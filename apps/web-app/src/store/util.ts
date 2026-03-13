import type { View } from "./types";

export function buildUrl(view: View, selectedNoteId: string | null, showInfoPanel: boolean, settingDefault: boolean): string {
  let path: string;
  if (view === "settings") {
    path = "/settings";
  } else if (view === "collections") {
    path = "/collections";
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

interface SyncUrlParams {
  view: View;
  selectedNoteId: string | null;
  showInfoPanel: boolean;
  settingDefault: boolean;
}

export function syncUrl({ view, selectedNoteId, showInfoPanel, settingDefault }: SyncUrlParams) {
  const url = buildUrl(view, selectedNoteId, showInfoPanel, settingDefault);
  if (url !== window.location.pathname + window.location.search) {
    window.history.pushState(null, "", url);
  }
}

export function parseUrl(): { view: View; selectedNoteId: string | null; showInfoPanel: boolean | null } {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const showInfoPanel = params.has("info") ? params.get("info") !== "0" : null;

  if (path === "/settings") {
    return { view: "settings", selectedNoteId: null, showInfoPanel };
  }

  if (path === "/collections") {
    return { view: "collections", selectedNoteId: null, showInfoPanel };
  }

  const noteMatch = path.match(/^\/notes\/(.+)$/);
  if (noteMatch) {
    return { view: "notes", selectedNoteId: noteMatch[1]!, showInfoPanel };
  }

  return { view: "notes", selectedNoteId: null, showInfoPanel };
}
