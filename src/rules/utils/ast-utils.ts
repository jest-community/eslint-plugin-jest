import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

export const isTokenASemicolon = (token: TSESTree.Token): boolean =>
  token.value === ';' && token.type === AST_TOKEN_TYPES.Punctuator;

export const areTokensOnSameLine = (
  left: TSESTree.Node | TSESTree.Token,
  right: TSESTree.Node | TSESTree.Token,
): boolean => left.loc.end.line === right.loc.start.line;

// We'll only verify nodes with these parent types
const STATEMENT_LIST_PARENTS = new Set([
  AST_NODE_TYPES.Program,
  AST_NODE_TYPES.BlockStatement,
  AST_NODE_TYPES.SwitchCase,
  AST_NODE_TYPES.SwitchStatement,
]);

export const isValidParent = (parentType: string): boolean => {
  return STATEMENT_LIST_PARENTS.has(parentType);
};

/**
 * Gets the actual last token.
 *
 * If a semicolon is semicolon-less style's semicolon, this ignores it.
 * For example:
 *
 *     foo()
 *     ;[1, 2, 3].forEach(bar)
 */
export const getActualLastToken = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
): TSESTree.Token => {
  const semiToken = sourceCode.getLastToken(node);
  const prevToken = sourceCode.getTokenBefore(semiToken);
  const nextToken = sourceCode.getTokenAfter(semiToken);
  const isSemicolonLessStyle = Boolean(
    prevToken &&
      nextToken &&
      prevToken.range[0] >= node.range[0] &&
      isTokenASemicolon(semiToken) &&
      semiToken.loc.start.line !== prevToken.loc.end.line &&
      semiToken.loc.end.line === nextToken.loc.start.line,
  );

  return isSemicolonLessStyle ? prevToken : semiToken;
};

/**
 * Gets padding line sequences between the given 2 statements.
 * Comments are separators of the padding line sequences.
 */
export const getPaddingLineSequences = (
  prevNode: TSESTree.Node,
  nextNode: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): TSESTree.Token[][] => {
  const pairs: TSESTree.Token[][] = [];
  const includeComments = true;
  let prevToken = getActualLastToken(sourceCode, prevNode);

  if (nextNode.loc.start.line - prevToken.loc.end.line >= 2) {
    do {
      const token = sourceCode.getTokenAfter(prevToken, {
        includeComments,
      }) as TSESTree.Token;

      if (token.loc.start.line - prevToken.loc.end.line >= 2) {
        pairs.push([prevToken, token]);
      }

      prevToken = token;
    } while (prevToken.range[0] < nextNode.range[0]);
  }

  return pairs;
};
