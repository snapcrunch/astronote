export { initDatabase, seedDatabase, closeDatabase } from './db';
export {
  getNotes,
  getNoteById,
  getNoteCount,
  getNotesForExport,
  createNote,
  updateNote,
  deleteNote,
  archiveNote,
  addNoteTag,
  removeNoteTag,
  incrementTags,
  decrementTags,
} from './notes';
export {
  getCollections,
  getUserCollectionByName,
  createCollection,
  deleteCollection,
  setDefaultCollection,
} from './collections';
export { getTags } from './tags';
export { getSettings, updateSettings, resetAll } from './settings';
export { createUser, getUserByEmail, getUserById, listUsers } from './users';
export { recordBackup, getLastBackup } from './backupHistory';
export {
  createRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  deleteRefreshTokensByUserId,
} from './refreshTokens';
export {
  createApiKey,
  getApiKeyById,
  getApiKeys,
  deleteApiKey,
} from './apiKeys';
export {
  getSettings as getSystemSettings,
  patchSettings as patchSystemSettings,
  updateSettings as updateSystemSettings,
} from './systemSettings';
