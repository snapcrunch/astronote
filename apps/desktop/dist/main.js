import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { initDatabase, seedDatabase } from "@repo/repository";
import * as domain from "@repo/domain";
let mainWindow = null;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: false
    }
  });
  if (process.env["VITE_DEV_SERVER_URL"]) {
    await mainWindow.loadURL(process.env["VITE_DEV_SERVER_URL"]);
  } else {
    await mainWindow.loadFile(
      path.join(import.meta.dirname, "..", "renderer", "index.html")
    );
  }
}
function registerIpcHandlers() {
  ipcMain.handle("fetchSettings", () => domain.getSettings());
  ipcMain.handle("updateSettings", (_e, updates) => domain.updateSettings(updates));
  ipcMain.handle("resetAll", () => domain.resetAll());
  ipcMain.handle("fetchTags", () => domain.listTags());
  ipcMain.handle("fetchCollections", () => domain.listCollections());
  ipcMain.handle("createCollection", (_e, name) => domain.createCollection(name));
  ipcMain.handle("deleteCollection", (_e, id) => domain.deleteCollection(id));
  ipcMain.handle("setDefaultCollection", async (_e, id) => {
    await domain.setDefaultCollection(id);
    return domain.listCollections();
  });
  ipcMain.handle(
    "fetchNotes",
    (_e, params) => domain.listNotes(params == null ? void 0 : params.q, params == null ? void 0 : params.tags, params == null ? void 0 : params.collectionId)
  );
  ipcMain.handle(
    "createNote",
    (_e, params) => domain.createNote({
      title: params.title,
      content: params.content,
      collectionId: params.collectionId ?? void 0
    })
  );
  ipcMain.handle("updateNote", (_e, id, updates) => domain.updateNote(id, updates));
  ipcMain.handle("deleteNote", (_e, id) => domain.archiveNote(id));
  ipcMain.handle("addTag", (_e, noteId, tag) => domain.addTag(noteId, tag));
  ipcMain.handle("removeTag", (_e, noteId, tag) => domain.removeTag(noteId, tag));
}
app.whenReady().then(async () => {
  const dbPath = path.join(app.getPath("userData"), "astronote.db");
  await initDatabase(dbPath);
  await seedDatabase();
  registerIpcHandlers();
  await createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
