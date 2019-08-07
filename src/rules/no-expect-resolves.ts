import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, isExpectCall } from './tsUtils';

function isIdentifierResolves(node: TSESTree.MemberExpression) {
  return (
    node.property.type === AST_NODE_TYPES.Identifier &&
    node.property.name === 'resolves'
  );
}

function isExpectResolves(node: TSESTree.MemberExpression) {
  return isExpectCall(node.object) && isIdentifierResolves(node);
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow expect.resolves',
      recommended: false,
    },
    messages: {
      expectResolves: 'Use `expect(await promise)` instead.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create: context => ({
    MemberExpression(node) {
      if (isExpectResolves(node)) {
        context.report({ node, messageId: 'expectResolves' });
      }
    },
  }),
});
