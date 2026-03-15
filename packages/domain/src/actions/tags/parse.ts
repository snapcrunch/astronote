export function parse(text: string): string[] {
  const stripped = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const matches = stripped.match(/#[a-zA-Z][a-zA-Z0-9]*/g);
  if (!matches) {
    return [];
  }
  const unique = new Set(matches.map((t) => t.toLowerCase()));
  return [...unique];
}
