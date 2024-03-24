import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow string interpolation inside snapshots',
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

        if (
          [
            'toMatchInlineSnapshot',
            'toThrowErrorMatchingInlineSnapshot',
          ].includes(getAccessorValue(jestFnCall.matcher))
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
