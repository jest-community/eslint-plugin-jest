import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  MaybeTypeCast,
  ParsedEqualityMatcherCall,
  ParsedExpectMatcher,
  createRule,
  followTypeAssertionChain,
  isExpectCall,
  isParsedEqualityMatcherCall,
  isStringNode,
  parseExpectCall,
} from './utils';

const isBooleanLiteral = (
  node: TSESTree.Node,
): node is TSESTree.BooleanLiteral =>
  node.type === AST_NODE_TYPES.Literal && typeof node.value === 'boolean';

type ParsedBooleanEqualityMatcherCall = ParsedEqualityMatcherCall<
  MaybeTypeCast<TSESTree.BooleanLiteral>
>;

/**
 * Checks if the given `ParsedExpectMatcher` is a call to one of the equality matchers,
 * with a boolean literal as the sole argument.
 *
 * @example javascript
 * toBe(true);
 * toEqual(false);
 *
 * @param {ParsedExpectMatcher} matcher
 *
 * @return {matcher is ParsedBooleanEqualityMatcher}
 */
const isBooleanEqualityMatcher = (
  matcher: ParsedExpectMatcher,
): matcher is ParsedBooleanEqualityMatcherCall =>
  isParsedEqualityMatcherCall(matcher) &&
  isBooleanLiteral(followTypeAssertionChain(matcher.arguments[0]));

const isString = (node: TSESTree.Node) => {
  return isStringNode(node) || node.type === AST_NODE_TYPES.TemplateLiteral;
};

const isComparingToString = (expression: TSESTree.BinaryExpression) => {
  return isString(expression.left) || isString(expression.right);
};

const invertOperator = (operator: string) => {
  switch (operator) {
    case '>':
      return '<=';
    case '<':
      return '>=';
    case '>=':
      return '<';
    case '<=':
      return '>';
  }

  return null;
};

const determineMatcher = (
  operator: string,
  negated: boolean,
): string | null => {
  const op = negated ? invertOperator(operator) : operator;

  switch (op) {
    case '>':
      return 'toBeGreaterThan';
    case '<':
      return 'toBeLessThan';
    case '>=':
      return 'toBeGreaterThanOrEqual';
    case '<=':
      return 'toBeLessThanOrEqual';
  }

  return null;
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using the built-in comparison matchers',
      recommended: false,
    },
    messages: {
      useToBeComparison: 'Prefer using `{{ preferredMatcher }}` instead',
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isExpectCall(node, context.getScope())) {
          return;
        }

        const {
          expect: {
            arguments: [comparison],
            range: [, expectCallEnd],
          },
          matcher,
          modifier,
        } = parseExpectCall(node);

        if (
          !matcher ||
          comparison?.type !== AST_NODE_TYPES.BinaryExpression ||
          isComparingToString(comparison) ||
          !isBooleanEqualityMatcher(matcher)
        ) {
          return;
        }

        const preferredMatcher = determineMatcher(
          comparison.operator,
          followTypeAssertionChain(matcher.arguments[0]).value === !!modifier,
        );

        if (!preferredMatcher) {
          return;
        }

        context.report({
          fix(fixer) {
            const sourceCode = context.getSourceCode();

            return [
              // replace the comparison argument with the left-hand side of the comparison
              fixer.replaceText(
                comparison,
                sourceCode.getText(comparison.left),
              ),
              // replace the current matcher & modifier with the preferred matcher
              fixer.replaceTextRange(
                [expectCallEnd, matcher.node.range[1]],
                `.${preferredMatcher}`,
              ),
              // replace the matcher argument with the right-hand side of the comparison
              fixer.replaceText(
                matcher.arguments[0],
                sourceCode.getText(comparison.right),
              ),
            ];
          },
          messageId: 'useToBeComparison',
          data: { preferredMatcher },
          node: (modifier || matcher).node.property,
        });
      },
    };
  },
});
