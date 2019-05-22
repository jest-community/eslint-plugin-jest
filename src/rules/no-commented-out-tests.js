'use strict';

const { getDocsUrl } = require('./util');

const message = 'Some tests seem to be commented';

function hasTests(node) {
  return /^\s*(x|f)?(test|it|describe)(\.\w+|\[['"]\w+['"]\])?\s*\(/m.test(
    node.value,
  );
}

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    function checkNode(node) {
      if (!hasTests(node)) return;

      context.report({
        message,
        node,
      });
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.filter(token => token.type !== 'Shebang').forEach(checkNode);
      },
    };
  },
};
