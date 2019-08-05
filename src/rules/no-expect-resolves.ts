import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule } from './tsUtils';

const isCallExpressionExpect = (node: TSESTree.MemberExpression) =>
  node.object.type === AST_NODE_TYPES.CallExpression &&
  node.object.callee.type === AST_NODE_TYPES.Identifier &&
  node.object.callee.name === 'expect';

const isIdentifierResolves = (node: TSESTree.MemberExpression) =>
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === 'resolves';

function isExpectResolves(node: TSESTree.MemberExpression) {
  if (isCallExpressionExpect(node) && isIdentifierResolves(node)) {
    return true;
  }

  return false;
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
