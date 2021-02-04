import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, getNodeName } from './utils';

const functions = [
  'resetModules',
  'clearAllMocks',
  'resetAllMocks',
  'restoreAllMocks',
] as Array<
  'resetModules' | 'clearAllMocks' | 'resetAllMocks' | 'restoreAllMocks'
>;

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow use of globally enabled functions',
      recommended: 'error',
    },
    messages: {
      noUnnecassaryFunction:
        'Unnecessary {{option}} call as it is enabled globally',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          reportFunctionNames: {
            type: 'array',
            items: {
              type: 'string',
              enum: functions,
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ reportFunctionNames: [] as typeof functions }],
  create(context) {
    const { reportFunctionNames = [] } = context.options[0] || {};
    const options = reportFunctionNames.map(name => `jest.${name}`);

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const option = getNodeName(node);

        if (!option || !options.includes(option)) {
          return;
        }

        context.report({
          messageId: 'noUnnecassaryFunction',
          data: {
            option,
          },
          node,
        });
      },
    };
  },
});
