import {
  expectCase,
  expectNotCase,
  expectRejectCase,
  expectResolveCase,
  getDocsUrl,
  method,
} from './util';

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      useToHaveLength: 'Use toHaveLength() instead',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          !(
            expectNotCase(node) ||
            expectResolveCase(node) ||
            expectRejectCase(node)
          ) &&
          expectCase(node) &&
          (method(node).name === 'toBe' || method(node).name === 'toEqual') &&
          node.arguments[0].property &&
          node.arguments[0].property.name === 'length'
        ) {
          const propertyDot = context
            .getSourceCode()
            .getFirstTokenBetween(
              node.arguments[0].object,
              node.arguments[0].property,
              token => token.value === '.',
            );
          context.report({
            fix(fixer) {
              return [
                fixer.remove(propertyDot),
                fixer.remove(node.arguments[0].property),
                fixer.replaceText(method(node), 'toHaveLength'),
              ];
            },
            messageId: 'useToHaveLength',
            node: method(node),
          });
        }
      },
    };
  },
};
