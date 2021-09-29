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
    fixable: 'code',
    messages: {
      expectResolves: 'Use `await expect(...).resolves instead.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node: TSESTree.CallExpression) {
      const [awaitNode] = node.arguments;

      if (
        isExpectCall(node) &&
        awaitNode?.type === AST_NODE_TYPES.AwaitExpression
      ) {
        context.report({
          node: node.arguments[0],
          messageId: 'expectResolves',
          fix(fixer) {
            return [
              fixer.insertTextBefore(node, 'await '),
              fixer.removeRange([
                awaitNode.range[0],
                awaitNode.argument.range[0],
              ]),
              fixer.insertTextAfter(node, '.resolves'),
            ];
          },
        });
      }
    },
  }),
});
