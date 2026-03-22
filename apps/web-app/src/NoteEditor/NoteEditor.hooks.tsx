import { useState, useEffect, useRef, useCallback } from 'react';
import type { Note } from '@repo/types';
import { useNoteStore } from '../store';

type UpdateNoteFn = ReturnType<typeof useNoteStore.getState>['updateNote'];

export function useDebouncedNoteUpdate(updateNote: UpdateNoteFn) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const pendingUpdate = useRef<{
    id: number;
    updates: Parameters<UpdateNoteFn>[1];
  } | null>(null);

  const debouncedUpdateNote = useCallback(
    (id: number, updates: Parameters<UpdateNoteFn>[1]) => {
      pendingUpdate.current = { id, updates };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        pendingUpdate.current = null;
        updateNote(id, updates);
      }, 500);
    },
    [updateNote]
  );

  const flushPendingUpdate = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingUpdate.current) {
      const { id, updates } = pendingUpdate.current;
      pendingUpdate.current = null;
      updateNote(id, updates);
    }
  }, [updateNote]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return { debouncedUpdateNote, flushPendingUpdate };
}

export function useImageResize(
  note: (Note & { content: string }) | null,
  updateNote: UpdateNoteFn
) {
  return useCallback(
    (attachmentId: string, width: number) => {
      if (!note) return;
      const content = note.content;
      const re = new RegExp(
        `(!\\[[^\\]]*\\]\\(attachment:${attachmentId})(#w=\\d+)?(\\))`,
        'g'
      );
      const newContent = content.replace(re, `$1#w=${width}$3`);
      if (newContent !== content) {
        updateNote(note.id, { content: newContent });
      }
    },
    [note, updateNote]
  );
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function loadImageDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

function computeSizedMarkdown(opts: {
  filename: string;
  id: string;
  dims: { width: number; height: number };
  containerWidth: number;
}) {
  const { filename, id, dims, containerWidth } = opts;
  const isLandscape = dims.width >= dims.height;
  const maxRatio = isLandscape ? 0.6 : 0.4;
  const maxWidth = Math.round(containerWidth * maxRatio);

  if (dims.width <= maxWidth) {
    return `![${filename}](attachment:${id})`;
  }

  const snapped = Math.round(maxWidth / 10) * 10;
  return `![${filename}](attachment:${id}#w=${snapped})`;
}

export function useAttachmentMarkdown(
  getAttachmentUrl: (id: string) => string
) {
  const contentRef = useRef<HTMLDivElement>(null);

  const buildAttachmentMarkdown = useCallback(
    (attachment: {
      filename: string;
      id: string;
      mimeType: string;
      dims: { width: number; height: number } | null;
    }) => {
      const { filename, id, mimeType, dims } = attachment;
      if (!mimeType.startsWith('image/')) {
        return `[${filename}](attachment:${id})`;
      }
      if (!dims) {
        return `![${filename}](attachment:${id})`;
      }
      const containerWidth = contentRef.current?.offsetWidth ?? 700;
      return computeSizedMarkdown({ filename, id, dims, containerWidth });
    },
    []
  );

  const buildFromFile = useCallback(
    async (
      attachment: { filename: string; id: string; mimeType: string },
      file: File
    ) => {
      const dims = await getImageDimensions(file);
      return buildAttachmentMarkdown({ ...attachment, dims });
    },
    [buildAttachmentMarkdown]
  );

  const buildFromUrl = useCallback(
    async (filename: string, id: string) => {
      const containerWidth = contentRef.current?.offsetWidth ?? 700;
      const url = getAttachmentUrl(id);
      try {
        const dims = await loadImageDimensions(url);
        return computeSizedMarkdown({ filename, id, dims, containerWidth });
      } catch {
        return `![${filename}](attachment:${id})`;
      }
    },
    [getAttachmentUrl]
  );

  return { contentRef, buildAttachmentMarkdown, buildFromFile, buildFromUrl };
}

export function useEditingState(noteId: number | undefined) {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const { editOnCreate, settings } = useNoteStore.getState();
    if (editOnCreate) {
      setEditing(true);
      useNoteStore.setState({ editOnCreate: false });
    } else {
      setEditing(settings.default_view === 'editor');
    }
  }, [noteId]);

  return { editing, setEditing };
}
