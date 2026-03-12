export function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function countStats(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { words: 0, sentences: 0, paragraphs: 0, characters: 0 };

  const words = trimmed.split(/\s+/).length;
  const sentences = trimmed.split(/[.!?]+\s*/g).filter(Boolean).length;
  const withoutCodeBlocks = trimmed.replace(/```[\s\S]*?```/g, "").trim();
  const paragraphs = withoutCodeBlocks ? withoutCodeBlocks.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const characters = trimmed.length;

  return { words, sentences, paragraphs, characters };
}

export interface Heading {
  level: number;
  text: string;
}

export function extractHeadings(content: string): Heading[] {
  const lines = content.split("\n");
  const headings: Heading[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({ level: match[1]!.length, text: match[2]!.replace(/[*_`]/g, "") });
    }
  }
  return headings;
}
