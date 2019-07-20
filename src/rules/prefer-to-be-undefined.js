import {
  argument,
  argument2,
  expectNotToBeCase,
  expectNotToEqualCase,
  expectToBeCase,
  expectToEqualCase,
  getDocsUrl,
  method,
  method2,
} from './util';

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      useToBeUndefined: 'Use toBeUndefined() instead',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const is =
          expectToBeCase(node, undefined) || expectToEqualCase(node, undefined);
        const isNot =
          expectNotToEqualCase(node, undefined) ||
          expectNotToBeCase(node, undefined);

        if (is || isNot) {
          context.report({
            fix(fixer) {
              if (is) {
                return [
                  fixer.replaceText(method(node), 'toBeUndefined'),
                  fixer.remove(argument(node)),
                ];
              }
              return [
                fixer.replaceText(method2(node), 'toBeUndefined'),
                fixer.remove(argument2(node)),
              ];
            },
            messageId: 'useToBeUndefined',
            node: is ? method(node) : method2(node),
          });
        }
      },
    };
  },
};
