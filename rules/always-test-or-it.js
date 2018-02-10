'use strict';

const isTestCase = require('./util').isTestCase;
const getNodeName = require('./util').getNodeName;

module.exports = {
  meta: {
    docs: {
      url:
        'https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/always-test-or-it.md',
    },
    fixable: 'code',
    schema: [{ enum: ['test', 'it'] }],
  },
  create(context) {
    const testName = context.options[0] || 'it';
    return {
      CallExpression(node) {
        const nodeName = getNodeName(node.callee);
        if (isTestCase(node) && nodeName.indexOf(testName) === -1) {
          context.report({
            message: "Always use '{{ testName }}' test names",
            node: node.callee,
            data: { testName },
            fix(fixer) {
              // Ignore fixing fit(), since there is no ftest()
              if (nodeName === 'fit') {
                return [];
              }

              const nodeToReplace =
                node.callee.type === 'MemberExpression'
                  ? node.callee.object
                  : node.callee;
              const newTestName =
                nodeName.charAt(0) === 'f' || nodeName.charAt(0) === 'x'
                  ? nodeName.charAt(0) + testName
                  : testName;

              return [fixer.replaceText(nodeToReplace, newTestName)];
            },
          });
        }
      },
    };
  },
};
