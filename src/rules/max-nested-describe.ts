import type { TSESTree } from '@typescript-eslint/utils';
import { createRule, isTypeOfJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Enforces a maximum depth to nested describe calls',
    },
    messages: {
      exceededMaxDepth:
        'Too many nested describe calls ({{ depth }}) - maximum allowed is {{ max }}',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 0,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ max: 5 }],
  create(context, [{ max }]) {
    const describes: TSESTree.CallExpression[] = [];

    return {
      CallExpression(node) {
        if (isTypeOfJestFnCall(node, context, ['describe'])) {
          describes.unshift(node);

          if (describes.length > max) {
            context.report({
              node,
              messageId: 'exceededMaxDepth',
              data: { depth: describes.length, max },
            });
          }
        }
      },
      'CallExpression:exit'(node) {
        if (describes[0] === node) {
          describes.shift();
        }
      },
    };
  },
});
