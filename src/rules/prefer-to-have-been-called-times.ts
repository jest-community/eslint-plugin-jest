import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule, isSupportedAccessor, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    fixable: 'code',
    docs: {
      description: 'Suggest using `toHaveBeenCalledTimes()`',
    },
    messages: {
      preferMatcher: 'Prefer `toHaveBeenCalledTimes`',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const { parent: expect } = jestFnCall.head.node;

        if (expect?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const { matcher } = jestFnCall;

        if (!isSupportedAccessor(matcher, 'toHaveLength')) {
          return;
        }

        const [argument] = expect.arguments;

        // check if the last property in the chain is `calls`
        if (
          argument?.type !== AST_NODE_TYPES.MemberExpression ||
          !isSupportedAccessor(argument.property, 'calls')
        ) {
          return;
        }

        const { object } = argument;

        // check if the second-to-last property in the chain is `mock`
        if (
          object.type !== AST_NODE_TYPES.MemberExpression ||
          !isSupportedAccessor(object.property, 'mock')
        ) {
          return;
        }

        context.report({
          messageId: 'preferMatcher',
          node: matcher,
          fix(fixer) {
            return [
              // remove the "mock.calls" accessor chain
              fixer.removeRange([
                object.property.range[0] - 1,
                argument.range[1],
              ]),
              // replace the current matcher with "toHaveBeenCalledTimes"
              fixer.replaceTextRange(
                [matcher.parent.object.range[1], matcher.parent.range[1]],
                '.toHaveBeenCalledTimes',
              ),
            ];
          },
        });
      },
    };
  },
});
