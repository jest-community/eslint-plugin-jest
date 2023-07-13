import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  EqualityMatcher,
  createRule,
  getAccessorValue,
  getFirstMatcherArg,
  isBooleanLiteral,
  isStringNode,
  parseJestFnCall,
} from './utils';

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
      description: 'Suggest using the built-in comparison matchers',
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
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect' || jestFnCall.args.length === 0) {
          return;
        }

        const { parent: expect } = jestFnCall.head.node;

        if (expect?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const {
          arguments: [comparison],
          range: [, expectCallEnd],
        } = expect;

        const { matcher } = jestFnCall;
        const matcherArg = getFirstMatcherArg(jestFnCall);

        if (
          comparison?.type !== AST_NODE_TYPES.BinaryExpression ||
          isComparingToString(comparison) ||
          !EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) ||
          !isBooleanLiteral(matcherArg)
        ) {
          return;
        }

        const [modifier] = jestFnCall.modifiers;
        const hasNot = jestFnCall.modifiers.some(
          nod => getAccessorValue(nod) === 'not',
        );

        const preferredMatcher = determineMatcher(
          comparison.operator,
          matcherArg.value === hasNot,
        );

        if (!preferredMatcher) {
          return;
        }

        context.report({
          fix(fixer) {
            const sourceCode = context.getSourceCode();

            // preserve the existing modifier if it's not a negation
            const modifierText =
              modifier && getAccessorValue(modifier) !== 'not'
                ? `.${getAccessorValue(modifier)}`
                : '';

            return [
              // replace the comparison argument with the left-hand side of the comparison
              fixer.replaceText(
                comparison,
                sourceCode.getText(comparison.left),
              ),
              // replace the current matcher & modifier with the preferred matcher
              fixer.replaceTextRange(
                [expectCallEnd, matcher.parent.range[1]],
                `${modifierText}.${preferredMatcher}`,
              ),
              // replace the matcher argument with the right-hand side of the comparison
              fixer.replaceText(
                matcherArg,
                sourceCode.getText(comparison.right),
              ),
            ];
          },
          messageId: 'useToBeComparison',
          data: { preferredMatcher },
          node: matcher,
        });
      },
    };
  },
});
