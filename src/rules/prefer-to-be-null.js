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
      useToBeNull: 'Use toBeNull() instead',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const is = expectToBeCase(node, null) || expectToEqualCase(node, null);
        const isNot =
          expectNotToEqualCase(node, null) || expectNotToBeCase(node, null);

        if (is || isNot) {
          context.report({
            fix(fixer) {
              if (is) {
                return [
                  fixer.replaceText(method(node), 'toBeNull'),
                  fixer.remove(argument(node)),
                ];
              }
              return [
                fixer.replaceText(method2(node), 'toBeNull'),
                fixer.remove(argument2(node)),
              ];
            },
            messageId: 'useToBeNull',
            node: is ? method(node) : method2(node),
          });
        }
      },
    };
  },
};
