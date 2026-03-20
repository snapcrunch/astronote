import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  pinned: z.boolean(),
});

export type Note = z.infer<typeof NoteSchema>;

export const NoteSummarySchema = NoteSchema.omit({ content: true });

export type NoteSummary = z.infer<typeof NoteSummarySchema>;

export const CreateNoteInputSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  content: z.string().optional(),
  pinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  collectionId: z.number().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;

export const UpdateNoteInputSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  pinned: z.boolean().optional(),
  collectionId: z.number().optional(),
});

export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>;

export const ListNotesQuerySchema = z.object({
  q: z.string().optional(),
  tags: z
    .string()
    .transform((s) => s.split(','))
    .optional(),
  collectionId: z.coerce.number().optional(),
  includeContent: z.coerce.boolean().optional(),
});

export const GraphQuerySchema = z.object({
  collectionId: z.coerce.number().optional(),
  tags: z
    .string()
    .transform((s) => s.split(','))
    .optional(),
});

export const AddTagInputSchema = z.object({
  tag: z.string().min(1),
});

export const IdParamSchema = z.object({
  id: z.coerce.number(),
});

export const CreateCollectionInputSchema = z.object({
  name: z.string().min(1),
});

export const ListTagsQuerySchema = z.object({
  collectionId: z.coerce.number().optional(),
});

export const CollectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  isDefault: z.boolean(),
  noteCount: z.number(),
});

export type Collection = z.infer<typeof CollectionSchema>;

export const DefaultViewSchema = z.enum(['editor', 'renderer']);

export type DefaultView = z.infer<typeof DefaultViewSchema>;

export const ThemeIdSchema = z.enum([
  'default',
  'dark',
  'solarized-light',
  'solarized-dark',
  'nord',
  'dracula',
  'geek-light',
]);

export type ThemeId = z.infer<typeof ThemeIdSchema>;

export const BackupMechanismSchema = z.enum(['disabled', 'git']);

export type BackupMechanism = z.infer<typeof BackupMechanismSchema>;

export const BackupIntervalSchema = z.enum(['none', 'daily', 'hourly']);

export type BackupInterval = z.infer<typeof BackupIntervalSchema>;

export const SettingsSchema = z.object({
  default_view: DefaultViewSchema,
  show_info_panel: z.boolean(),
  theme: ThemeIdSchema,
  intro_dismissed: z.boolean(),
  backup_mechanism: BackupMechanismSchema,
  backup_ssh_private_key: z.string(),
  backup_interval: BackupIntervalSchema,
  backup_repo_ssh_url: z
    .string()
    .refine((val) => val === '' || /^git@[\w.-]+:[\w./-]+\.git$/.test(val), {
      message:
        'Must be a valid Git SSH URL (e.g. git@github.com:user/repo.git)',
    }),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const AuthUserSchema = z.object({
  id: z.number(),
  email: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

export const ApiKeyWithTokenSchema = ApiKeySchema.extend({
  token: z.string(),
});

export type ApiKeyWithToken = z.infer<typeof ApiKeyWithTokenSchema>;

export const CreateApiKeyInputSchema = z.object({
  name: z.string().min(1),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInputSchema>;

export const NoteIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const UuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const DEFAULT_SETTINGS: Settings = {
  default_view: 'renderer',
  show_info_panel: true,
  theme: 'default',
  intro_dismissed: false,
  backup_mechanism: 'disabled',
  backup_ssh_private_key: '',
  backup_interval: 'daily',
  backup_repo_ssh_url: '',
};
