import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { useNoteStore } from '../../store';
import {
  isMarkdownFile,
  titleFromFilename,
  parseFrontmatter,
  type FrontmatterAttachment,
} from './util';

interface ImportFile {
  name: string;
  content: string;
}

export function useImport() {
  const importNote = useNoteStore((s) => s.importNote);
  const uploadAttachment = useNoteStore((s) => s.uploadAttachment);
  const updateNote = useNoteStore((s) => s.updateNote);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const fetchTags = useNoteStore((s) => s.fetchTags);
  const fetchCollections = useNoteStore((s) => s.fetchCollections);
  const createCollection = useNoteStore((s) => s.createCollection);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveCollectionId = useCallback(
    async (name: string): Promise<number> => {
      const collections = useNoteStore.getState().collections;
      const existing = collections.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) return existing.id;
      await createCollection(name);
      const updated = useNoteStore.getState().collections;
      const created = updated.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      return created!.id;
    },
    [createCollection]
  );

  const importMarkdownFiles = useCallback(
    async (
      files: ImportFile[],
      attachmentBlobs: Map<string, Blob>
    ) => {
      const validFiles = files.filter((f) => titleFromFilename(f.name));
      if (validFiles.length === 0) {
        setStatus('No markdown files found.');
        setTimeout(() => setStatus(null), 3000);
        return;
      }

      setProgress({ current: 0, total: validFiles.length });
      useNoteStore.setState({ importing: true, importedCount: 0 });

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]!;
          const { frontmatter, body } = parseFrontmatter(file.content);
          const title = frontmatter.title || titleFromFilename(file.name);
          const tags = frontmatter.tags;
          let collectionId: number | undefined;
          if (frontmatter.collection) {
            collectionId = await resolveCollectionId(frontmatter.collection);
          }

          const note = await importNote(title, body, {
            id: frontmatter.id,
            tags,
            collectionId,
            pinned: frontmatter.pinned,
            createdAt: frontmatter.createdAt,
            updatedAt: frontmatter.updatedAt,
          });

          // Upload attachments and rewrite UUIDs in content
          if (frontmatter.attachments && frontmatter.attachments.length > 0) {
            let updatedContent = note.content;
            let contentChanged = false;

            for (const fmAtt of frontmatter.attachments) {
              const blob = findAttachmentBlob(attachmentBlobs, fmAtt);
              if (!blob) continue;

              const attachmentFile = new File([blob], fmAtt.filename, {
                type: blob.type || guessMimeType(fmAtt.filename),
              });
              const uploaded = await uploadAttachment(note.id, attachmentFile);

              // Replace old UUID references with new UUID
              if (fmAtt.id !== uploaded.id) {
                const oldRef = `attachment:${fmAtt.id}`;
                const newRef = `attachment:${uploaded.id}`;
                if (updatedContent.includes(oldRef)) {
                  updatedContent = updatedContent.split(oldRef).join(newRef);
                  contentChanged = true;
                }
              }
            }

            if (contentChanged) {
              await updateNote(note.id, { content: updatedContent });
            }
          }

          setProgress({ current: i + 1, total: validFiles.length });
        }
        await Promise.all([fetchNotes(), fetchTags(), fetchCollections()]);
      } finally {
        useNoteStore.setState({
          importing: false,
          importedCount: validFiles.length,
        });
        setProgress(null);
      }
    },
    [
      importNote,
      uploadAttachment,
      updateNote,
      fetchNotes,
      fetchTags,
      fetchCollections,
      resolveCollectionId,
    ]
  );

  const processFiles = useCallback(
    async (fileList: File[]) => {
      const mdFiles: ImportFile[] = [];
      const attachmentBlobs = new Map<string, Blob>();
      let zipFile: File | null = null;

      for (const file of fileList) {
        if (file.name.endsWith('.zip')) {
          zipFile = file;
        } else if (isMarkdownFile(file.name)) {
          const content = await file.text();
          mdFiles.push({ name: file.name, content });
        }
      }

      if (zipFile) {
        const buf = await zipFile.arrayBuffer();
        const zip = await JSZip.loadAsync(buf);
        const entries = Object.entries(zip.files);
        for (const [path, entry] of entries) {
          if (entry.dir) continue;
          if (isMarkdownFile(path)) {
            const content = await entry.async('string');
            mdFiles.push({ name: path, content });
          } else if (path.startsWith('attachments/')) {
            const blob = await entry.async('blob');
            // Key by the filename in the attachments/ folder (e.g. "uuid.png")
            const filename = path.split('/').pop()!;
            attachmentBlobs.set(filename, blob);
          }
        }
      }

      if (mdFiles.length === 0) {
        setStatus('No markdown files found.');
        setTimeout(() => setStatus(null), 3000);
        return;
      }

      await importMarkdownFiles(mdFiles, attachmentBlobs);
    },
    [importMarkdownFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) processFiles(files);
      e.target.value = '';
    },
    [processFiles]
  );

  return {
    dragOver,
    setDragOver,
    status,
    progress,
    fileInputRef,
    handleDrop,
    handleFileInput,
  };
}

/**
 * Find the blob for a frontmatter attachment in the extracted attachments map.
 * The ZIP stores files as `attachments/{uuid}.{ext}`, so we match by UUID prefix.
 */
function findAttachmentBlob(
  blobs: Map<string, Blob>,
  att: FrontmatterAttachment
): Blob | undefined {
  // Try exact match by UUID prefix
  for (const [filename, blob] of blobs) {
    if (filename.startsWith(att.id)) {
      return blob;
    }
  }
  return undefined;
}

function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    zip: 'application/zip',
  };
  return mimeTypes[ext ?? ''] ?? 'application/octet-stream';
}
