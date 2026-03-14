export function isMarkdownFile(name: string): boolean {
  return /\.(md|markdown|mdown|mkd|mkdn|mdwn|mdtxt|mdtext|txt)$/i.test(name);
}

export function titleFromFilename(name: string): string {
  const basename = name.includes('/') ? name.split('/').pop()! : name;
  return basename.replace(/\.[^.]+$/, '');
}

export interface Frontmatter {
  title?: string;
  tags?: string[];
  collection?: string;
  pinned?: boolean;
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

  for (const line of raw.split(/\r?\n/)) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (key === 'title' && value) {
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
    }
  }

  return { frontmatter, body };
}
