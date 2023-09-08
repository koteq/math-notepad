import { parser } from "./mathjs.grammar";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import {completeFromList} from "@codemirror/autocomplete";

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Identifier: t.name,
      Boolean: t.bool,
      String: t.string,
      Number: t.number,
      LineComment: t.lineComment,
      PropertyName: t.propertyName,
      ArithOp: t.arithmeticOperator,
      ElWiseOp: t.arithmeticOperator,
      BitOp: t.bitwiseOperator,
      CompareOp: t.compareOperator,
      LogicOp: t.logicOperator,
      "( )": t.paren,
      "[ ]": t.squareBracket,
      "{ }": t.brace,
    }),
    // indentNodeProp.add({
    //   Application: context => context.column(context.node.from) + context.unit
    // }),
    // foldNodeProp.add({
    //   Application: foldInside
    // })
  ]
})

export const mathjsLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    commentTokens: { line: "#" },
  },
});



export const mathjsCompletion = mathjsLanguage.data.of({
  autocomplete: completeFromList([
    {label: "defun", type: "keyword"},
    {label: "defvar", type: "keyword"},
    {label: "let", type: "keyword"},
    {label: "cons", type: "function"},
    {label: "car", type: "function"},
    {label: "cdr", type: "function"}
  ])
})

export function mathjs() {
  return new LanguageSupport(mathjsLanguage, [mathjsCompletion]);
}
