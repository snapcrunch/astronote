import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import type { NoteSummary } from '@repo/types';

export function wikiLinkCompletion(
  getNotes: () => NoteSummary[],
  getCurrentNoteId: () => number | undefined
): Extension {
  return autocompletion({
    override: [
      (context: CompletionContext): CompletionResult | null => {
        const line = context.state.doc.lineAt(context.pos);
        const textBefore = line.text.slice(0, context.pos - line.from);
        const match = textBefore.match(/\[\[([^\]]*)$/);
        if (!match) return null;

        const query = match[1]!.toLowerCase();
        const from = context.pos - match[1]!.length;
        const currentId = getCurrentNoteId();

        // Count any auto-closed brackets after the cursor
        const textAfter = line.text.slice(context.pos - line.from);
        const trailing = textAfter.match(/^\]{0,2}/)?.[0].length ?? 0;

        const options = getNotes()
          .filter(
            (n) => n.id !== currentId && n.title.toLowerCase().includes(query)
          )
          .map((n) => ({
            label: n.title,
            apply: `${n.id}` + ']]'.slice(trailing),
          }));

        return { from, options };
      },
    ],
  });
}
