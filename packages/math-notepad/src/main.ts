import { foldEffect, foldState, unfoldEffect } from "@codemirror/language";
import {
  EditorSelection,
  SelectionRange,
  EditorState,
  EditorStateConfig,
} from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { EditorView, basicSetup } from "codemirror";
import { evaluateMathjsInline } from "codemirror-extension-evaluate-mathjs-inline";
import { mathjs } from "codemirror-language-mathjs";

const localStorageState = new (class {
  storageKey = "editorState";

  loadState(config: EditorStateConfig): EditorState {
    const serializedState = localStorage.getItem(this.storageKey);
    if (serializedState) {
      try {
        const jsonState = JSON.parse(serializedState);

        return EditorState.fromJSON(jsonState, config, { fold: foldState });
      } catch (error) {
        console.warn(
          "Caught error attempting to restore editor's state",
          error,
        );
      }
    }

    return EditorState.create(config);
  }

  storeState(state: EditorState): void {
    const jsonState = state.toJSON({ fold: foldState });
    localStorage.setItem(this.storageKey, JSON.stringify(jsonState));
  }
})();

function isFoldChanged(update: ViewUpdate): boolean {
  return update.transactions.some((transaction) =>
    transaction.effects.some(
      (effect) => effect.is(foldEffect) || effect.is(unfoldEffect),
    ),
  );
}

new EditorView({
  state: localStorageState.loadState({
    extensions: [
      basicSetup,
      mathjs(),
      evaluateMathjsInline,
      EditorView.updateListener.of((update) => {
        if (update.docChanged || update.selectionSet || isFoldChanged(update)) {
          localStorageState.storeState(update.state);
        }
      }),
    ],
  }),
  parent: document.body,
});
