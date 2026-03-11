"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Settings
  fetchSettings: () => electron.ipcRenderer.invoke("fetchSettings"),
  updateSettings: (updates) => electron.ipcRenderer.invoke("updateSettings", updates),
  resetAll: () => electron.ipcRenderer.invoke("resetAll"),
  // Tags
  fetchTags: () => electron.ipcRenderer.invoke("fetchTags"),
  // Collections
  fetchCollections: () => electron.ipcRenderer.invoke("fetchCollections"),
  createCollection: (name) => electron.ipcRenderer.invoke("createCollection", name),
  deleteCollection: (id) => electron.ipcRenderer.invoke("deleteCollection", id),
  setDefaultCollection: (id) => electron.ipcRenderer.invoke("setDefaultCollection", id),
  // Notes
  fetchNotes: (params) => electron.ipcRenderer.invoke("fetchNotes", params),
  createNote: (params) => electron.ipcRenderer.invoke("createNote", params),
  updateNote: (id, updates) => electron.ipcRenderer.invoke("updateNote", id, updates),
  deleteNote: (id) => electron.ipcRenderer.invoke("deleteNote", id),
  addTag: (noteId, tag) => electron.ipcRenderer.invoke("addTag", noteId, tag),
  removeTag: (noteId, tag) => electron.ipcRenderer.invoke("removeTag", noteId, tag)
});
