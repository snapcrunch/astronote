export function isMarkdownFile(name: string): boolean {
  return /\.(md|markdown|mdown|mkd|mkdn|mdwn|mdtxt|mdtext|txt)$/i.test(name);
}

export function titleFromFilename(name: string): string {
  const basename = name.includes('/') ? name.split('/').pop()! : name;
  return basename.replace(/\.[^.]+$/, '');
}

export interface FrontmatterAttachment {
  id: string;
  filename: string;
}

export interface Frontmatter {
  id?: number;
  title?: string;
  tags?: string[];
  collection?: string;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
  attachments?: FrontmatterAttachment[];
}

export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1]!;
  const body = match[2]!;
  const frontmatter: Frontmatter = {};
  const lines = raw.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();

    if (key === 'id' && value) {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) frontmatter.id = parsed;
    } else if (key === 'title' && value) {
      frontmatter.title = value;
    } else if (key === 'tags' && value) {
      frontmatter.tags = value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (key === 'collection' && value) {
      frontmatter.collection = value;
    } else if (key === 'pinned') {
      frontmatter.pinned = value.toLowerCase() === 'true';
    } else if (key === 'createdat' && value) {
      frontmatter.createdAt = value;
    } else if (key === 'updatedat' && value) {
      frontmatter.updatedAt = value;
    } else if (key === 'attachments' && !value) {
      // Parse YAML-style list items that follow
      const attachments: FrontmatterAttachment[] = [];
      let current: Partial<FrontmatterAttachment> = {};
      while (i + 1 < lines.length) {
        const next = lines[i + 1]!;
        if (/^\s+-\s+/.test(next)) {
          // New list item — save previous if complete
          if (current.id && current.filename) {
            attachments.push(current as FrontmatterAttachment);
          }
          current = {};
          const kvMatch = next.match(/^\s+-\s+(\w+):\s*(.+)$/);
          if (kvMatch) {
            current[kvMatch[1] as 'id' | 'filename'] = kvMatch[2]!;
          }
          i++;
        } else if (/^\s+\w+:/.test(next)) {
          // Continuation property of current item
          const kvMatch = next.match(/^\s+(\w+):\s*(.+)$/);
          if (kvMatch) {
            current[kvMatch[1] as 'id' | 'filename'] = kvMatch[2]!;
          }
          i++;
        } else {
          break;
        }
      }
      if (current.id && current.filename) {
        attachments.push(current as FrontmatterAttachment);
      }
      if (attachments.length > 0) {
        frontmatter.attachments = attachments;
      }
    }
  }

  return { frontmatter, body };
}
