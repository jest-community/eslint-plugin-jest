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

        let targetNode = method(node);
        if (targetNode.name === 'rejects') {
          targetNode = method(node.parent);
        }

        const propertyName = method(targetNode) && method(targetNode).name;

        // Look for `toThrow` calls with no arguments.
        if (
          ['toThrow', 'toThrowError'].includes(propertyName) &&
          !argument(targetNode)
        ) {
          context.report({
            messageId: 'requireRethrow',
            data: { propertyName },
            node: targetNode,
          });
        }
      },
    };
  },
};
