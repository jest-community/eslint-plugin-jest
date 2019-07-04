'use strict';

const {
  getDocsUrl,
  hasExpressions,
  isDescribe,
  isTestCase,
  isTemplateLiteral,
  isString,
  getStringValue,
} = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      describe: 'describe should not have an empty title',
      test: 'test should not have an empty title',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const is = {
          describe: isDescribe(node),
          testCase: isTestCase(node),
        };
        if (!is.describe && !is.testCase) {
          return;
        }
        const [firstArgument] = node.arguments;
        if (!isString(firstArgument)) {
          return;
        }
        if (isTemplateLiteral(firstArgument) && hasExpressions(firstArgument)) {
          return;
        }
        if (getStringValue(firstArgument) === '') {
          context.report({
            messageId: is.describe ? 'describe' : 'test',
            node,
          });
        }
      },
    };
  },
};
