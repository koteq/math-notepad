import type { Range } from "@codemirror/state";
import type { EditorView, ViewUpdate } from "@codemirror/view";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";
import { all, create } from "mathjs";

type CompilationCache = Map<string, math.EvalFunction>;

export const evaluateMathjsInline = ViewPlugin.fromClass(
  class {
    math = create(all);
    decorations = Decoration.none;
    cache: CompilationCache = new Map();

    constructor(readonly editor: EditorView) {
      this.evaluateDoc();
    }

    update(update: ViewUpdate): void {
      if (update.docChanged) {
        this.evaluateDoc();
      }
    }

    evaluateDoc(): void {
      const scope = new Map();
      const widgets: Range<Decoration>[] = [];
      const newCache: CompilationCache = new Map();
      const selectionLine = this.editor.state.doc.lineAt(
        this.editor.state.selection.main.head,
      ).number;

      for (
        let currentLine = 1;
        currentLine <= this.editor.state.doc.lines;
        currentLine++
      ) {
        const line = this.editor.state.doc.line(currentLine);

        let result: unknown;
        try {
          const compiled =
            this.cache.get(line.text) ?? this.math.compile(line.text);
          newCache.set(line.text, compiled);
          result = compiled.evaluate(scope);
          scope.set("$_", result);
        } catch (error) {
          result = currentLine === selectionLine ? undefined : error;
        }

        if (result !== undefined && typeof result !== "function") {
          const widget = Decoration.widget({
            widget: new ResultWidget(result),
            side: 1,
          });
          widgets.push(widget.range(line.to));
        }
      }

      this.cache = newCache;
      this.decorations = Decoration.set(widgets);
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

class ResultWidget extends WidgetType {
  constructor(private readonly result: unknown) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.style.opacity = "0.5";
    span.className = "cm-inline-mathjs-result";

    if (this.result instanceof Error) {
      span.style.color = "red";
      span.textContent = ` ${this.result}`;
    } else {
      span.textContent = ` = ${this.result}`;
    }

    return span;
  }
}
