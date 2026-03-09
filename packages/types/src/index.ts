import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;

export const CreateNoteInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;

export const UpdateNoteInputSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
});

export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>;

export const CollectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  isDefault: z.boolean(),
});

export type Collection = z.infer<typeof CollectionSchema>;

export const DefaultViewSchema = z.enum(["editor", "renderer"]);

export type DefaultView = z.infer<typeof DefaultViewSchema>;

export const ThemeIdSchema = z.enum([
  "default",
  "dark",
  "solarized-light",
  "solarized-dark",
  "nord",
  "dracula",
  "geek-light",
]);

export type ThemeId = z.infer<typeof ThemeIdSchema>;

export const AuthMethodSchema = z.enum(["none", "basic"]);

export type AuthMethod = z.infer<typeof AuthMethodSchema>;

export const SettingsSchema = z.object({
  default_view: DefaultViewSchema,
  show_info_panel: z.boolean(),
  theme: ThemeIdSchema,
  auth_method: AuthMethodSchema,
  auth_username: z.string(),
  auth_password: z.string(),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  default_view: "renderer",
  show_info_panel: true,
  theme: "default",
  auth_method: "none",
  auth_username: "",
  auth_password: "",
};
