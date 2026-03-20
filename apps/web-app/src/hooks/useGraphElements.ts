import { useMemo } from 'react';
import type { Note, NoteSummary } from '@repo/types';
import type { ElementDefinition } from 'cytoscape';

const WIKI_LINK_RE = /\[\[(\d+)\]\]/g;
const MAX_TAG_GROUP_SIZE = 8;

function extractWikiLinkIds(content: string): number[] {
  const ids: number[] = [];
  for (const m of content.matchAll(WIKI_LINK_RE)) {
    ids.push(Number(m[1]));
  }
  return ids;
}

interface GraphElements {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
}

export function computeGraphElements(notes: Note[]): GraphElements {
  const noteIds = new Set(notes.map((n) => n.id));
  const nodes: ElementDefinition[] = notes.map((n) => ({
    data: { id: String(n.id), label: n.title },
  }));

  const edges: ElementDefinition[] = [];
  const edgeSet = new Set<string>();

  // Wiki-link edges
  for (const note of notes) {
    const linkIds = extractWikiLinkIds(note.content);
    for (const targetId of linkIds) {
      if (!noteIds.has(targetId)) continue;
      const key = `wl:${note.id}:${targetId}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({
        data: {
          id: key,
          source: String(note.id),
          target: String(targetId),
          type: 'wikilink',
        },
      });
    }
  }

  // Shared-tag edges via inverted index
  const tagIndex = new Map<string, number[]>();
  for (const note of notes) {
    for (const tag of note.tags) {
      let group = tagIndex.get(tag);
      if (!group) {
        group = [];
        tagIndex.set(tag, group);
      }
      group.push(note.id);
    }
  }

  for (const [, group] of tagIndex) {
    if (group.length < 2 || group.length > MAX_TAG_GROUP_SIZE) continue;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = Math.min(group[i]!, group[j]!);
        const b = Math.max(group[i]!, group[j]!);
        const key = `tag:${a}:${b}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push({
          data: {
            id: key,
            source: String(a),
            target: String(b),
            type: 'shared-tag',
          },
        });
      }
    }
  }

  return { nodes, edges };
}

export function computeLocalGraphElements(
  selectedNote: Note,
  allNotes: NoteSummary[]
): GraphElements {
  const linkIds = new Set(extractWikiLinkIds(selectedNote.content));
  const tagSet = new Set(selectedNote.tags);

  // Find neighbors: notes linked via wiki-links or sharing tags
  const neighbors = allNotes.filter(
    (n) =>
      n.id !== selectedNote.id &&
      (linkIds.has(n.id) || n.tags.some((t) => tagSet.has(t)))
  );

  const neighborIds = new Set(neighbors.map((n) => n.id));

  const nodes: ElementDefinition[] = [
    {
      data: {
        id: String(selectedNote.id),
        label: selectedNote.title,
        focused: true,
      },
    },
    ...neighbors.map((n) => ({
      data: { id: String(n.id), label: n.title },
    })),
  ];

  const edges: ElementDefinition[] = [];
  const edgeSet = new Set<string>();

  // Outgoing wiki-link edges from selected note
  for (const targetId of linkIds) {
    if (!neighborIds.has(targetId)) continue;
    const key = `wl:${selectedNote.id}:${targetId}`;
    edgeSet.add(key);
    edges.push({
      data: {
        id: key,
        source: String(selectedNote.id),
        target: String(targetId),
        type: 'wikilink',
      },
    });
  }

  // Shared-tag edges between selected note and neighbors
  for (const neighbor of neighbors) {
    if (neighbor.tags.some((t) => tagSet.has(t))) {
      const a = Math.min(selectedNote.id, neighbor.id);
      const b = Math.max(selectedNote.id, neighbor.id);
      const key = `tag:${a}:${b}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({
        data: {
          id: key,
          source: String(a),
          target: String(b),
          type: 'shared-tag',
        },
      });
    }
  }

  return { nodes, edges };
}

export function useFullGraphElements(notes: Note[]): GraphElements {
  return useMemo(() => computeGraphElements(notes), [notes]);
}

export function useLocalGraphElements(
  selectedNote: Note | null,
  allNotes: NoteSummary[]
): GraphElements | null {
  return useMemo(() => {
    if (!selectedNote) return null;
    return computeLocalGraphElements(selectedNote, allNotes);
  }, [selectedNote, allNotes]);
}
