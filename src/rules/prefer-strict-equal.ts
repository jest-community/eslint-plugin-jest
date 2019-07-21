import { createRule, isExpectCallWithParent } from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using toStrictEqual()',
      recommended: false,
    },
    messages: {
      useToStrictEqual: 'Use toStrictEqual() instead',
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isExpectCallWithParent(node)) {
          return;
        }

        const methodNode = node.parent.property;

        if (methodNode && methodNode.name === 'toEqual') {
          context.report({
            fix(fixer) {
              return [fixer.replaceText(methodNode, 'toStrictEqual')];
            },
            messageId: 'useToStrictEqual',
            node: methodNode,
          });
        }
      },
    };
  },
});
