'use strict';

const getDocsUrl = require('./util').getDocsUrl;

const message = `Jest is automatically in scope. Do not import "jest", as Jest doesn't export anything.`;

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    return {
      'ImportDeclaration[source.value="jest"]'(node) {
        context.report({ node, message });
      },
      'CallExpression[callee.name="require"][arguments.0.value="jest"]'(node) {
        context.report({
          loc: {
            end: {
              column: node.arguments[0].loc.end.column,
              line: node.arguments[0].loc.end.line,
            },
            start: node.arguments[0].loc.start,
          },
          message,
        });
      },
    };
  },
};
