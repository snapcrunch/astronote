import { visit, SKIP } from 'unist-util-visit';
import type { Root, Element } from 'hast';

const ATTACHMENT_RE = /^attachment:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:#w=(\d+))?$/;

export default function rehypeAttachments(getUrl: (id: string) => string) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'code' || node.tagName === 'pre') return SKIP;

      if (node.tagName === 'img') {
        const src = String(node.properties?.src ?? '');
        const match = src.match(ATTACHMENT_RE);
        if (match) {
          node.properties!.src = getUrl(match[1]!);
          node.properties!['data-attachment-id'] = match[1]!;
          if (match[2]) {
            node.properties!.width = match[2];
          }
        }
      }

      if (node.tagName === 'a') {
        const href = String(node.properties?.href ?? '');
        const match = href.match(ATTACHMENT_RE);
        if (match) {
          node.properties!.href = getUrl(match[1]!);
          node.properties!.target = '_blank';
          node.properties!.rel = 'noopener noreferrer';
        }
      }
    });
  };
}
