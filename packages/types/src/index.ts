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
