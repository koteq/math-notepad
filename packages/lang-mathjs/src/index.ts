import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, LRLanguage, syntaxTree } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import { constants } from "./constants";
import { parser } from "./mathjs.grammar";

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
  ],
});

export const mathjsLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    commentTokens: { line: "#" },
  },
});

function completeMathjs(context: CompletionContext): CompletionResult | null {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (nodeBefore.name === "Identifier") {

    return {
      from: context.pos,
      options: constants,
      validFor: /^\w*$/
    }
  }

  return null;
}

const mathjsCompletions = mathjsLanguage.data.of({
  autocomplete: completeMathjs,
});

export function mathjs() {
  return new LanguageSupport(mathjsLanguage, [mathjsCompletions]);
}
