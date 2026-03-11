import { useRef, useEffect } from "react";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { basicSetup } from "codemirror";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  onEscape?: () => void;
}

function MarkdownEditor({ value, onChange, autoFocus, onEscape }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          keymap.of([
            {
              key: "Tab",
              run: (view) => {
                view.dispatch(view.state.replaceSelection("    "));
                return true;
              },
            },
            {
              key: "Escape",
              run: () => {
                onEscapeRef.current?.();
                return true;
              },
              preventDefault: true,
              stopPropagation: true,
            },
          ]),
          basicSetup,
          markdown({ codeLanguages: languages }),
          cmPlaceholder("Start writing…"),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "1rem",
            },
            ".cm-scroller": {
              overflow: "auto",
            },
            ".cm-content": {
              fontFamily: "'Roboto Mono', monospace",
              lineHeight: "1.8",
            },
            ".cm-gutters": {
              display: "none",
            },
            "&.cm-focused": {
              outline: "none",
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
    <div
      ref={containerRef}
      style={{ height: "100%", overflow: "hidden" }}
    />
  );
}

export default MarkdownEditor;
