import { getDb } from '../../db';

export interface GraphNode {
  id: number;
  label: string;
}

export interface GraphEdge {
  source: number;
  target: number;
  type: 'wikilink' | 'shared-tag';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const WIKI_LINK_RE = /\[\[(\d+)\]\]/g;
const MAX_TAG_GROUP_SIZE = 8;

export async function getGraph(params: {
  userId: number;
  collectionId?: number;
  tags?: string[];
}): Promise<GraphData> {
  const { userId, collectionId, tags } = params;
  const db = getDb();

  let q = db('notes')
    .join('users_notes', 'notes.id', 'users_notes.note_id')
    .where('users_notes.user_id', userId)
    .andWhere('notes.archived', 0);

  if (collectionId != null) {
    q = q.andWhere('notes.collectionId', collectionId);
  }

  if (tags && tags.length > 0) {
    for (const tag of tags) {
      q = q.andWhere(
        'notes.id',
        'in',
        db('note_tags').where('tag', tag).select('noteId')
      );
    }
  }

  const rows: { id: number; title: string; content: string }[] = await q
    .select('notes.id', 'notes.title', 'notes.content');

  const noteIds = new Set(rows.map((r) => r.id));

  // Build nodes
  const nodes: GraphNode[] = rows.map((r) => ({ id: r.id, label: r.title }));

  // Fetch all tags for these notes in one query
  const tagRows: { noteId: number; tag: string }[] = noteIds.size > 0
    ? await db('note_tags').whereIn('noteId', [...noteIds]).select('noteId', 'tag')
    : [];

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // Wiki-link edges
  for (const row of rows) {
    for (const m of row.content.matchAll(WIKI_LINK_RE)) {
      const targetId = Number(m[1]);
      if (!noteIds.has(targetId)) continue;
      const key = `wl:${row.id}:${targetId}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ source: row.id, target: targetId, type: 'wikilink' });
    }
  }

  // Shared-tag edges via inverted index
  const tagIndex = new Map<string, number[]>();
  for (const { noteId, tag } of tagRows) {
    let group = tagIndex.get(tag);
    if (!group) {
      group = [];
      tagIndex.set(tag, group);
    }
    group.push(noteId);
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
        edges.push({ source: a, target: b, type: 'shared-tag' });
      }
    }
  }

  return { nodes, edges };
}
