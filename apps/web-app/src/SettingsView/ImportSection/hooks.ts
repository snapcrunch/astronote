import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { useNoteStore } from '../../store';
import { isMarkdownFile, titleFromFilename, parseFrontmatter } from './util';

export function useImport() {
  const importNote = useNoteStore((s) => s.importNote);
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
    async (files: { name: string; content: string }[]) => {
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
          await importNote(title, body, {
            tags,
            collectionId,
            pinned: frontmatter.pinned,
            createdAt: frontmatter.createdAt,
            updatedAt: frontmatter.updatedAt,
          });
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
    [importNote, fetchNotes, fetchTags, fetchCollections, resolveCollectionId]
  );

  const processFiles = useCallback(
    async (fileList: File[]) => {
      const mdFiles: { name: string; content: string }[] = [];
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
          if (!isMarkdownFile(path)) continue;
          const content = await entry.async('string');
          mdFiles.push({ name: path, content });
        }
      }

      if (mdFiles.length === 0) {
        setStatus('No markdown files found.');
        setTimeout(() => setStatus(null), 3000);
        return;
      }

      await importMarkdownFiles(mdFiles);
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
