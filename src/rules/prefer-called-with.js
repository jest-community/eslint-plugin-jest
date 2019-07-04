'use strict';

const { getDocsUrl, expectCase, expectNotCase, method } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      preferCalledWith: 'Prefer {{name}}With(/* expected args */)',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Could check resolves/rejects here but not a likely idiom.
        if (expectCase(node) && !expectNotCase(node)) {
          const methodNode = method(node);
          const { name } = methodNode;
          if (name === 'toBeCalled' || name === 'toHaveBeenCalled') {
            context.report({
              data: { name },
              messageId: 'preferCalledWith',
              node: methodNode,
            });
          }
        }
      },
    };
  },
};
