import { useRef, useEffect } from 'react';
import {
  EditorView,
  keymap,
  placeholder as cmPlaceholder,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { basicSetup } from 'codemirror';
import { completionStatus } from '@codemirror/autocomplete';
import type { NoteSummary } from '@repo/types';
import { wikiLinkCompletion } from './NoteEditor/wikiLinkAutocomplete';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  onEscape?: () => void;
  notes?: NoteSummary[];
  currentNoteId?: number;
  onFileDrop?: (file: File) => Promise<string | null>;
}

function MarkdownEditor({
  value,
  onChange,
  autoFocus,
  onEscape,
  notes,
  currentNoteId,
  onFileDrop,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;
  const notesRef = useRef(notes ?? []);
  notesRef.current = notes ?? [];
  const currentNoteIdRef = useRef(currentNoteId);
  currentNoteIdRef.current = currentNoteId;
  const onFileDropRef = useRef(onFileDrop);
  onFileDropRef.current = onFileDrop;

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          keymap.of([
            {
              key: 'Tab',
              run: (view) => {
                view.dispatch(view.state.replaceSelection('    '));
                return true;
              },
            },
            {
              key: 'Escape',
              run: (view) => {
                if (completionStatus(view.state)) return false;
                onEscapeRef.current?.();
                return true;
              },
              preventDefault: true,
              stopPropagation: true,
            },
          ]),
          basicSetup,
          markdown({ codeLanguages: languages }),
          cmPlaceholder('Start writing…'),
          EditorView.lineWrapping,
          wikiLinkCompletion(
            () => notesRef.current,
            () => currentNoteIdRef.current
          ),
          EditorView.domEventHandlers({
            drop(event, view) {
              const handler = onFileDropRef.current;
              const files = event.dataTransfer?.files;
              if (!handler || !files?.length) return false;
              const file = files[0]!;
              // Only handle file drops, not text drops
              if (!file.type) return false;
              event.preventDefault();
              const pos = view.posAtCoords({
                x: event.clientX,
                y: event.clientY,
              });
              handler(file).then((text) => {
                if (text != null && pos != null) {
                  view.dispatch({ changes: { from: pos, insert: text } });
                }
              });
              return true;
            },
            paste(event, view) {
              const handler = onFileDropRef.current;
              const items = event.clipboardData?.items;
              if (!handler || !items) return false;
              for (const item of items) {
                if (item.kind === 'file') {
                  const file = item.getAsFile();
                  if (!file) continue;
                  event.preventDefault();
                  handler(file).then((text) => {
                    if (text != null) {
                      const { from, to } = view.state.selection.main;
                      view.dispatch({ changes: { from, to, insert: text } });
                    }
                  });
                  return true;
                }
              }
              return false;
            },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '14px',
            },
            '.cm-scroller': {
              overflow: 'auto',
            },
            '.cm-content': {
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: '1.8',
            },
            '.cm-gutters': {
              display: 'none',
            },
            '&.cm-focused': {
              outline: 'none',
            },
            '.cm-activeLine': {
              backgroundColor: 'transparent',
            },
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    if (autoFocus) view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only create the editor once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.hasFocus) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div ref={containerRef} style={{ height: '100%', overflow: 'hidden' }} />
  );
}

export default MarkdownEditor;
