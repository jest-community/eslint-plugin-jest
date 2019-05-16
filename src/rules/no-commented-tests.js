'use strict';

const { getDocsUrl } = require('./util');

const message = 'Some tests seem to be commented';

function hasAssertions(node) {
  return /x?(test|it|describe)((\.only|\.skip|\[['"]skip['"]\]))?\(/.test(
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
      if (!hasAssertions(node)) return;

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
