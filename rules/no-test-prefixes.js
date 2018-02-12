'use strict';

const getNodeName = require('./util').getNodeName;
const isTestCase = require('./util').isTestCase;
const isDescribe = require('./util').isDescribe;

module.exports = {
  meta: {
    docs: {
      url:
        'https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-test-prefixes.md',
    },
    fixable: 'code',
  },
  create(context) {
    return {
      CallExpression: node => {
        const nodeName = getNodeName(node.callee);

        if (!isDescribe(node) && !isTestCase(node)) return;

        const preferredNodeName = getPreferredNodeName(nodeName);

        if (!preferredNodeName) return;

        context.report({
          message: 'Use "{{ preferredNodeName }}" instead',
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
    return nodeName.slice(1) + '.only';
  }

  if (firstChar === 'x') {
    return nodeName.slice(1) + '.skip';
  }
}
