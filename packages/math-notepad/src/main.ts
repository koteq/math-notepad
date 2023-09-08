import { EditorView, basicSetup } from "codemirror";
import { renderInlineSuggestionPlugin } from "codemirror-extension-inline-mathjs-expressions";
import { mathjs } from "codemirror-language-mathjs";
import { EditorState } from "@codemirror/state";

new EditorView({
  state: EditorState.create({
    doc: localStorage.getItem("doc") ?? "",
    extensions: [
      basicSetup,
      mathjs(),
      renderInlineSuggestionPlugin,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          localStorage.setItem("doc", update.state.doc.toString());
        }
      }),
    ],
  }),
  parent: document.body,
});
