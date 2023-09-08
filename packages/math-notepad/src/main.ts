import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { evaluateMathjsInline } from "codemirror-extension-evaluate-mathjs-inline";
import { mathjs } from "codemirror-language-mathjs";

new EditorView({
  state: EditorState.create({
    doc: localStorage.getItem("doc") ?? "",
    extensions: [
      basicSetup,
      mathjs(),
      evaluateMathjsInline,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          localStorage.setItem("doc", update.state.doc.toString());
        }
      }),
    ],
  }),
  parent: document.body,
});
