import { visit, SKIP } from 'unist-util-visit';
import type { Root, Element, Text, ElementContent } from 'hast';

const WIKI_LINK_RE = /\[\[(\d+)\]\]/g;

export default function rehypeWikiLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'code' || node.tagName === 'pre') return SKIP;

      const newChildren: ElementContent[] = [];
      let changed = false;

      for (const child of node.children) {
        if (child.type !== 'text') {
          newChildren.push(child);
          continue;
        }

        const text = child.value;
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        WIKI_LINK_RE.lastIndex = 0;

        while ((match = WIKI_LINK_RE.exec(text)) !== null) {
          changed = true;
          const before = text.slice(lastIndex, match.index);
          if (before) {
            newChildren.push({ type: 'text', value: before } as Text);
          }
          newChildren.push({
            type: 'element',
            tagName: 'wiki-link',
            properties: { noteId: match[1] },
            children: [],
          } as Element);
          lastIndex = match.index + match[0].length;
        }

        const after = text.slice(lastIndex);
        if (after) {
          newChildren.push({ type: 'text', value: after } as Text);
        }
      }

      if (changed) {
        node.children = newChildren;
      }
    });
  };
}
