import { AST, SourceCode } from 'eslint';
// This is because we are using @types/estree that are brought in with eslint
// eslint-disable-next-line import/no-extraneous-dependencies
import { Node } from 'estree';

export const isTokenASemicolon = (token: AST.Token): boolean =>
  token.value === ';' && token.type === 'Punctuator';

export const areTokensOnSameLine = (
  left: Node | AST.Token,
  right: Node | AST.Token,
): boolean => left.loc.end.line === right.loc.start.line;

// We'll only verify nodes with these parent types
const STATEMENT_LIST_PARENTS = new Set([
  'Program',
  'BlockStatement',
  'SwitchCase',
  'SwitchStatement',
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
  sourceCode: SourceCode,
  node: Node,
): AST.Token => {
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
  prevNode: Node,
  nextNode: Node,
  sourceCode: SourceCode,
): AST.Token[][] => {
  const pairs: AST.Token[][] = [];
  const includeComments = true;
  let prevToken = getActualLastToken(sourceCode, prevNode);

  if (nextNode.loc.start.line - prevToken.loc.end.line >= 2) {
    do {
      const token = sourceCode.getTokenAfter(prevToken, {
        includeComments,
      }) as AST.Token;

      if (token.loc.start.line - prevToken.loc.end.line >= 2) {
        pairs.push([prevToken, token]);
      }

      prevToken = token;
    } while (prevToken.range[0] < nextNode.range[0]);
  }

  return pairs;
};
