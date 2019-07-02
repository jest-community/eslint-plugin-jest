'use strict';

const { posix } = require('path');
const { getDocsUrl } = require('./util');

const mocksDirName = '__mocks__';

const isMockPath = path => path.split(posix.sep).includes(mocksDirName);

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      noManualImport: `Mocks should not be manually imported from a ${mocksDirName} directory. Instead use jest.mock and import from the original module path.`,
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (isMockPath(node.source.value)) {
          context.report({ node, messageId: 'noManualImport' });
        }
      },
      'CallExpression[callee.name="require"]'(node) {
        if (
          node.arguments.length &&
          node.arguments[0].value &&
          isMockPath(node.arguments[0].value)
        ) {
          context.report({
            loc: node.arguments[0].loc,
            messageId: 'noManualImport',
          });
        }
      },
    };
  },
};
