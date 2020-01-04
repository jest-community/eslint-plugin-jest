import {
  ModifierName,
  createRule,
  isExpectCall,
  isSupportedAccessor,
} from './utils';

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
      if (
        isExpectCall(node.object) &&
        isSupportedAccessor(node.property, ModifierName.resolves)
      ) {
        context.report({ node: node.property, messageId: 'expectResolves' });
      }
    },
  }),
});
