// Direct copy of https://github.com/saminzadeh/codemirror-extension-inline-suggestion/tree/main
import {
  ViewPlugin,
  DecorationSet,
  EditorView,
  ViewUpdate,
  Decoration,
  WidgetType,
  keymap,
} from "@codemirror/view";
import {
  StateEffect,
  Text,
  Prec,
  StateField,
  EditorState,
  EditorSelection,
  TransactionSpec,
  Range,
} from "@codemirror/state";

import * as math from "mathjs";

function debouncePromise<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  abortValue: any = undefined
) {
  let cancel = () => {
    // do nothing
  };
  // type Awaited<T> = T extends PromiseLike<infer U> ? U : T
  type ReturnT = Awaited<ReturnType<T>>;
  const wrapFunc = (...args: Parameters<T>): Promise<ReturnT> => {
    cancel();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(fn(...args)), wait);
      cancel = () => {
        clearTimeout(timer);
        if (abortValue !== undefined) {
          reject(abortValue);
        }
      };
    });
  };
  return wrapFunc;
}

// Current state of the autosuggestion
const InlineSuggestionState = StateField.define<{ suggestion: null | string }>({
  create() {
    return { suggestion: null };
  },
  update(__, tr) {
    const inlineSuggestion = tr.effects.find((e) =>
      e.is(InlineSuggestionEffect)
    );
    if (tr.state.doc)
      if (inlineSuggestion && tr.state.doc == inlineSuggestion.value.doc) {
        return { suggestion: inlineSuggestion.value.text };
      }
    return { suggestion: null };
  },
});

const InlineSuggestionEffect = StateEffect.define<{
  text: string | null;
  doc: Text;
}>();

/**
 * Provides a suggestion for the next word
 */
function inlineSuggestionDecoration(view: EditorView) {
  const scope = new Map();
  const widgets: Range<Decoration>[] = [];

  for (let n = 1; n <= view.state.doc.lines; n++) {
    const line = view.state.doc.line(n);

    let result: unknown;
    let parsed: math.MathNode | null = null;
    let compiled: math.EvalFunction | null = null;
    try {
      // TODO add cache?
      // var cached = calque.cache[line.code];
      // if (!cached) {
      //   const parsed = math.parse(line.code);
      //   const compiled = parsed.compile();
      //   cached = { parsed, compiled };
      //   calque.cache[line.code] = cached;
      // }

      parsed = math.parse(line.text);
      compiled = parsed.compile();
      result = compiled.evaluate(scope);
      scope.set("$_", result);
    } catch (error) {
      result = error;
    }

    if (result !== undefined && typeof result !== "function") {
      const widget = Decoration.widget({
        widget: new InlineSuggestionWidget(result),
        side: 1,
      });
      widgets.push(widget.range(line.to));
    }
  }

  // for (const {from, to} of view.visibleRanges) {
  //   for (let pos = from; pos <= to;) {
  //     const line = view.state.doc.lineAt(pos)
  //     const w = Decoration.widget({
  //       widget: new InlineSuggestionWidget(prefix),
  //       side: 1,
  //     });
  //     widgets.push(w.range(line.to));
  //     pos = line.to + 1;
  //   }
  // }
  return Decoration.set(widgets);

  // const pos = view.state.selection.main.head;
  // const widgets = [];
  // const w = Decoration.widget({
  //   widget: new InlineSuggestionWidget(prefix),
  //   side: 1,
  // });
  // widgets.push(w.range(pos));
  // return Decoration.set(widgets);
}

class InlineSuggestionWidget extends WidgetType {
  constructor(private readonly suggestion: unknown) {
    super();
  }
  toDOM() {
    const div = document.createElement("span");
    div.style.opacity = "0.4";
    div.className = "cm-inline-suggestion";
    let prefix = " = ";
    if (this.suggestion instanceof Error) {
      prefix = " ";
      div.style.color = "red";
    }
    div.textContent = `${prefix}${this.suggestion}`;
    return div;
  }
}

type InlineFetchFn = (state: EditorState) => Promise<string>;

export const fetchSuggestion = (fetchFn: InlineFetchFn) =>
  ViewPlugin.fromClass(
    class Plugin {
      async update(update: ViewUpdate) {
        const doc = update.state.doc;
        // Only fetch if the document has changed
        if (!update.docChanged) {
          return;
        }
        const result = await fetchFn(update.state);
        update.view.dispatch({
          effects: InlineSuggestionEffect.of({ text: result, doc: doc }),
        });
      }
    }
  );

export const renderInlineSuggestionPlugin = ViewPlugin.fromClass(
  class Plugin {
    decorations: DecorationSet;
    constructor(editor: EditorView) {
      this.decorations = inlineSuggestionDecoration(editor);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = inlineSuggestionDecoration(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

const inlineSuggestionKeymap = Prec.highest(
  keymap.of([
    {
      key: "Tab",
      run: (view) => {
        const suggestionText = view.state.field(
          InlineSuggestionState
        )?.suggestion;

        // If there is no suggestion, do nothing and let the default keymap handle it
        if (!suggestionText) {
          return false;
        }

        view.dispatch({
          ...insertCompletionText(
            view.state,
            suggestionText,
            view.state.selection.main.head,
            view.state.selection.main.head
          ),
        });
        return true;
      },
    },
  ])
);

function insertCompletionText(
  state: EditorState,
  text: string,
  from: number,
  to: number
): TransactionSpec {
  return {
    ...state.changeByRange((range) => {
      if (range == state.selection.main)
        return {
          changes: { from: from, to: to, insert: text },
          range: EditorSelection.cursor(from + text.length),
        };
      const len = to - from;
      if (
        !range.empty ||
        (len &&
          state.sliceDoc(range.from - len, range.from) !=
            state.sliceDoc(from, to))
      )
        return { range };
      return {
        changes: { from: range.from - len, to: range.from, insert: text },
        range: EditorSelection.cursor(range.from - len + text.length),
      };
    }),
    userEvent: "input.complete",
  };
}

type InlineSuggestionOptions = {
  fetchFn: (state: EditorState) => Promise<string>;
  delay?: number;
};

export function inlineSuggestion(options: InlineSuggestionOptions) {
  const { delay = 500 } = options;
  const fetchFn = debouncePromise(options.fetchFn, delay);
  return [
    InlineSuggestionState,
    fetchSuggestion(fetchFn),
    renderInlineSuggestionPlugin,
    inlineSuggestionKeymap,
  ];
}
