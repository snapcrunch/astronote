import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Settings
  fetchSettings: () => ipcRenderer.invoke("fetchSettings"),
  updateSettings: (updates: unknown) => ipcRenderer.invoke("updateSettings", updates),
  resetAll: () => ipcRenderer.invoke("resetAll"),

  // Tags
  fetchTags: () => ipcRenderer.invoke("fetchTags"),

  // Collections
  fetchCollections: () => ipcRenderer.invoke("fetchCollections"),
  createCollection: (name: string) => ipcRenderer.invoke("createCollection", name),
  deleteCollection: (id: number) => ipcRenderer.invoke("deleteCollection", id),
  setDefaultCollection: (id: number) => ipcRenderer.invoke("setDefaultCollection", id),

  // Notes
  fetchNotes: (params?: unknown) => ipcRenderer.invoke("fetchNotes", params),
  createNote: (params: unknown) => ipcRenderer.invoke("createNote", params),
  updateNote: (id: string, updates: unknown) => ipcRenderer.invoke("updateNote", id, updates),
  deleteNote: (id: string) => ipcRenderer.invoke("deleteNote", id),
  addTag: (noteId: string, tag: string) => ipcRenderer.invoke("addTag", noteId, tag),
  removeTag: (noteId: string, tag: string) => ipcRenderer.invoke("removeTag", noteId, tag),
});
