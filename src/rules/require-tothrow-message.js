import { argument, expectCase, getDocsUrl, method } from './util';

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      requireRethrow: 'Add an error message to {{ propertyName }}()',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!expectCase(node)) {
          return;
        }

        const propertyName = method(node) && method(node).name;

        // Look for `toThrow` calls with no arguments.
        if (
          ['toThrow', 'toThrowError'].includes(propertyName) &&
          !argument(node)
        ) {
          context.report({
            messageId: 'requireRethrow',
            data: { propertyName },
            node: method(node),
          });
        }
      },
    };
  },
};
