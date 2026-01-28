/**
 * CodeEditor - CodeMirror 6 integration for code editing
 */

import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { Decoration } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

const setHighlightedLine = StateEffect.define();

const lineHighlightField = StateField.define({
  create: () => Decoration.none,
  update(decorations, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setHighlightedLine)) {
        if (effect.value === null) return Decoration.none;
        const line = tr.state.doc.line(effect.value);
        return Decoration.set([Decoration.line({ class: 'cm-highlighted-line' }).range(line.from)]);
      }
    }
    return decorations;
  },
  provide: f => EditorView.decorations.from(f)
});

const customTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px' },
  '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" },
  '.cm-content': { padding: '10px 0' },
  '.cm-line': { padding: '0 10px' },
  '.cm-highlighted-line': { backgroundColor: 'rgba(88, 166, 255, 0.15) !important' },
  '.cm-gutters': { backgroundColor: '#161b22', borderRight: '1px solid #30363d' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px', minWidth: '40px' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(88, 166, 255, 0.1)' }
});

export class CodeEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.onChange = options.onChange || (() => {});
    this.readOnly = false;
    
    this.view = new EditorView({
      state: this.createState(options.initialCode || '// Write your code here\n', false),
      parent: container
    });
  }

  createState(doc, readOnly) {
    return EditorState.create({
      doc,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        javascript(),
        oneDark,
        customTheme,
        syntaxHighlighting(defaultHighlightStyle),
        lineHighlightField,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of(update => {
          if (update.docChanged) this.onChange(this.getValue());
        }),
        EditorState.readOnly.of(readOnly)
      ]
    });
  }

  getValue() {
    return this.view.state.doc.toString();
  }

  setValue(code) {
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: code }
    });
  }

  highlightLine(lineNumber) {
    if (lineNumber === null || lineNumber === undefined) {
      this.clearHighlight();
      return;
    }

    const doc = this.view.state.doc;
    if (lineNumber < 1 || lineNumber > doc.lines) return;

    this.view.dispatch({ effects: setHighlightedLine.of(lineNumber) });

    const line = doc.line(lineNumber);
    this.view.dispatch({ effects: EditorView.scrollIntoView(line.from, { y: 'center' }) });
  }

  clearHighlight() {
    this.view.dispatch({ effects: setHighlightedLine.of(null) });
  }

  setReadOnly(readOnly) {
    this.readOnly = readOnly;
    const doc = this.getValue();
    this.view.setState(this.createState(doc, readOnly));
  }

  focus() {
    this.view.focus();
  }

  destroy() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
  }
}

export default CodeEditor;
