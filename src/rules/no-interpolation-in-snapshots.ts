import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow string interpolation inside snapshots',
      recommended: 'error',
    },
    messages: {
      noInterpolation: 'Do not use string interpolation inside of snapshots',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const matcher = jestFnCall.members[jestFnCall.members.length - 1];

        if (!matcher) {
          return;
        }

        if (
          [
            'toMatchInlineSnapshot',
            'toThrowErrorMatchingInlineSnapshot',
          ].includes(getAccessorValue(matcher))
        ) {
          // Check all since the optional 'propertyMatchers' argument might be present
          jestFnCall.args.forEach(argument => {
            if (
              argument.type === AST_NODE_TYPES.TemplateLiteral &&
              argument.expressions.length > 0
            ) {
              context.report({
                messageId: 'noInterpolation',
                node: argument,
              });
            }
          });
        }
      },
    };
  },
});
