'use strict';

const getDocsUrl = require('./util').getDocsUrl;

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const propertyName = node.callee.property && node.callee.property.name;

        // Look for `toThrow` calls with no arguments.
        if (
          ['toThrow', 'toThrowError'].indexOf(propertyName) > -1 &&
          !(node.arguments[0] && node.arguments[0].type === 'Literal')
        ) {
          context.report({
            message: `Add an error message to {{ propertyName }}()`,
            data: {
              propertyName,
            },
            node: node.callee.property,
          });
        }
      },
    };
  },
};
