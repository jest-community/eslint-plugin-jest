'use strict';

const { getDocsUrl } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      unexpectedImport: `Jest is automatically in scope. Do not import "jest", as Jest doesn't export anything.`,
    },
    schema: [],
  },
  create(context) {
    return {
      'ImportDeclaration[source.value="jest"]'(node) {
        context.report({ node, messageId: 'unexpectedImport' });
      },
      'CallExpression[callee.name="require"][arguments.0.value="jest"]'(node) {
        context.report({
          loc: node.arguments[0].loc,
          messageId: 'unexpectedImport',
        });
      },
    };
  },
};
