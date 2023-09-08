import type { Range } from "@codemirror/state";
import type { EditorView, ViewUpdate } from "@codemirror/view";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";

import * as math from "mathjs";

type CompilationCache = Map<string, math.EvalFunction>;

export const evaluateMathjsInline = ViewPlugin.fromClass(
  class {
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

      for (let n = 1; n <= this.editor.state.doc.lines; n++) {
        const line = this.editor.state.doc.line(n);

        let result: unknown;
        try {
          const compiled = this.cache.get(line.text) ?? math.compile(line.text);
          newCache.set(line.text, compiled);
          result = compiled.evaluate(scope);
          scope.set("$_", result);
        } catch (error) {
          result = error;
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
