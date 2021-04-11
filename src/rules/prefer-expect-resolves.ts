import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, isExpectCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Prefer `await expect(...).resolves` over `expect(await ...)` syntax',
      recommended: false,
    },
    messages: {
      expectResolves: 'Use `await expect(...).resolves instead.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node: TSESTree.CallExpression) {
      if (
        isExpectCall(node) &&
        node.arguments.length &&
        node.arguments[0].type === AST_NODE_TYPES.AwaitExpression
      ) {
        context.report({
          node: node.arguments[0],
          messageId: 'expectResolves',
        });
      }
    },
  }),
});
