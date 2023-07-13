import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  type CallExpressionWithSingleArgument,
  EqualityMatcher,
  type KnownCallExpression,
  ModifierName,
  createRule,
  getAccessorValue,
  getFirstMatcherArg,
  hasOnlyOneArgument,
  isBooleanLiteral,
  isSupportedAccessor,
  parseJestFnCall,
} from './utils';

type FixableIncludesCallExpression = KnownCallExpression<'includes'> &
  CallExpressionWithSingleArgument;

/**
 * Checks if the given `node` is a `CallExpression` representing the calling
 * of an `includes`-like method that can be 'fixed' (using `toContain`).
 *
 * @param {CallExpression} node
 *
 * @return {node is FixableIncludesCallExpression}
 */
const isFixableIncludesCallExpression = (
  node: TSESTree.Node,
): node is FixableIncludesCallExpression =>
  node.type === AST_NODE_TYPES.CallExpression &&
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(node.callee.property, 'includes') &&
  hasOnlyOneArgument(node) &&
  node.arguments[0].type !== AST_NODE_TYPES.SpreadElement;

// expect(array.includes(<value>)[not.]{toBe,toEqual}(<boolean>)
export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest using `toContain()`',
    },
    messages: {
      useToContain: 'Use toContain() instead',
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
          arguments: [includesCall],
          range: [, expectCallEnd],
        } = expect;

        const { matcher } = jestFnCall;
        const matcherArg = getFirstMatcherArg(jestFnCall);

        if (
          !includesCall ||
          matcherArg.type === AST_NODE_TYPES.SpreadElement ||
          !EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) ||
          !isBooleanLiteral(matcherArg) ||
          !isFixableIncludesCallExpression(includesCall)
        ) {
          return;
        }

        const hasNot = jestFnCall.modifiers.some(
          nod => getAccessorValue(nod) === 'not',
        );

        context.report({
          fix(fixer) {
            const sourceCode = context.getSourceCode();

            // we need to negate the expectation if the current expected
            // value is itself negated by the "not" modifier
            const addNotModifier = matcherArg.value === hasNot;

            return [
              // remove the "includes" call entirely
              fixer.removeRange([
                includesCall.callee.property.range[0] - 1,
                includesCall.range[1],
              ]),
              // replace the current matcher with "toContain", adding "not" if needed
              fixer.replaceTextRange(
                [expectCallEnd, matcher.parent.range[1]],
                addNotModifier
                  ? `.${ModifierName.not}.toContain`
                  : '.toContain',
              ),
              // replace the matcher argument with the value from the "includes"
              fixer.replaceText(
                jestFnCall.args[0],
                sourceCode.getText(includesCall.arguments[0]),
              ),
            ];
          },
          messageId: 'useToContain',
          node: matcher,
        });
      },
    };
  },
});
