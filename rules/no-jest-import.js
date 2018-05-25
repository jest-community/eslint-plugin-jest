'use strict';

const getDocsUrl = require('./util').getDocsUrl;
const getNodeName = require('./util').getNodeName;
const message = `Jest is automatically in scope. Do not import "jest", as Jest doesn't export anything.`;

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === 'jest') {
          context.report({
            node,
            message,
          });
        }
      },
      CallExpression(node) {
        const calleeName = getNodeName(node.callee);
        if (
          calleeName === 'require' &&
          node.arguments[0] &&
          node.arguments[0].value === 'jest'
        ) {
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
        }
      },
    };
  },
};
