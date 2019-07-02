'use strict';

const { getDocsUrl, getNodeName, isTestCase, isDescribe } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      usePreferredName: 'Use "{{ preferredNodeName }}" instead',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const nodeName = getNodeName(node.callee);

        if (!isDescribe(node) && !isTestCase(node)) return;

        const preferredNodeName = getPreferredNodeName(nodeName);

        if (!preferredNodeName) return;

        context.report({
          messageId: 'usePreferredName',
          node: node.callee,
          data: { preferredNodeName },
          fix(fixer) {
            return [fixer.replaceText(node.callee, preferredNodeName)];
          },
        });
      },
    };
  },
};

function getPreferredNodeName(nodeName) {
  const firstChar = nodeName.charAt(0);

  if (firstChar === 'f') {
    return `${nodeName.slice(1)}.only`;
  }

  if (firstChar === 'x') {
    return `${nodeName.slice(1)}.skip`;
  }
}
