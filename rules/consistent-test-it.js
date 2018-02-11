'use strict';

const getNodeName = require('./util').getNodeName;
const isTestCase = require('./util').isTestCase;
const isDescribe = require('./util').isDescribe;

module.exports = {
  meta: {
    docs: {
      url:
        'https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/consistent-test-it.md',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          fn: {
            enum: ['it', 'test'],
          },
          withinDescribe: {
            enum: ['it', 'test'],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const configObj = context.options[0];
    const testKeyword = (configObj && configObj.fn) || 'test';
    const testKeywordWithinDescribe =
      (configObj && configObj.withinDescribe) ||
      (configObj && configObj.fn) ||
      'it';

    let describeNestingLevel = 0;

    return {
      CallExpression(node) {
        const nodeName = getNodeName(node.callee);

        if (isDescribe(node)) {
          describeNestingLevel++;
        }

        if (
          isTestCase(node) &&
          describeNestingLevel === 0 &&
          nodeName.indexOf(testKeyword) === -1
        ) {
          const opositeTestKeyword = getOpositeTestKeyword(testKeyword);

          context.report({
            message:
              "Prefer using '{{ testKeyword }}' instead of '{{ opositeTestKeyword }}'",
            node: node.callee,
            data: { testKeyword, opositeTestKeyword },
            fix(fixer) {
              const nodeToReplace =
                node.callee.type === 'MemberExpression'
                  ? node.callee.object
                  : node.callee;

              const fixedNodeName = getPreferedNodeName(nodeName, testKeyword);
              return [fixer.replaceText(nodeToReplace, fixedNodeName)];
            },
          });
        }

        if (
          isTestCase(node) &&
          describeNestingLevel > 0 &&
          nodeName.indexOf(testKeywordWithinDescribe) === -1
        ) {
          const opositeTestKeyword = getOpositeTestKeyword(
            testKeywordWithinDescribe
          );

          context.report({
            message:
              "Prefer using '{{ testKeywordWithinDescribe }}' instead of '{{ opositeTestKeyword }}' within describe",
            node: node.callee,
            data: { testKeywordWithinDescribe, opositeTestKeyword },
            fix(fixer) {
              const nodeToReplace =
                node.callee.type === 'MemberExpression'
                  ? node.callee.object
                  : node.callee;

              const fixedNodeName = getPreferedNodeName(
                nodeName,
                testKeywordWithinDescribe
              );
              return [fixer.replaceText(nodeToReplace, fixedNodeName)];
            },
          });
        }
      },
      'CallExpression:exit'(node) {
        if (isDescribe(node)) {
          describeNestingLevel--;
        }
      },
    };
  },
};

function getPreferedNodeName(nodeName, preferedTestKeyword) {
  switch (nodeName) {
    case 'fit':
      return 'test.only';
    default:
      return nodeName.startsWith('f') || nodeName.startsWith('x')
        ? nodeName.charAt(0) + preferedTestKeyword
        : preferedTestKeyword;
  }
}

function getOpositeTestKeyword(test) {
  if (test === 'test') {
    return 'it';
  }

  return 'test';
}
