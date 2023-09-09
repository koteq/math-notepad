import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import {
  LRLanguage,
  LanguageSupport,
  foldService,
  syntaxTree,
} from "@codemirror/language";
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

const mathjsFoldings = foldService.of(
  (
    state,
    lineStart,
    _lineEnd,
  ): {
    from: number;
    to: number;
  } | null => {
    const startNode = syntaxTree(state).cursorAt(lineStart, 1).node;
    if (!startNode.type.is("LineComment")) {
      return null;
    }

    let endNode = startNode;
    while (endNode.nextSibling && !endNode.nextSibling.type.is("LineComment")) {
      endNode = endNode.nextSibling;
    }
    if (endNode === startNode) {
      return null;
    }

    return { from: startNode.to, to: endNode.to - 1 };
  },
);

function completeMathjs(context: CompletionContext): CompletionResult | null {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (nodeBefore.name === "Identifier") {
    return {
      from: context.pos,
      options: constants,
      validFor: /^\w*$/,
    };
  }

  return null;
}

const mathjsCompletions = mathjsLanguage.data.of({
  autocomplete: completeMathjs,
});

export function mathjs(): LanguageSupport {
  return new LanguageSupport(mathjsLanguage, [
    mathjsFoldings,
    mathjsCompletions,
  ]);
}
