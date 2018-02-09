'use strict';

const isDescribe = require('./util').isDescribe;
const isFunction = require('./util').isFunction;

const isAsync = node => node.async;

const hasParams = node => node.params.length > 0;

const paramsLocation = params => {
  const first = params[0];
  const last = params[params.length - 1];
  return {
    start: {
      line: first.loc.start.line,
      column: first.loc.start.column,
    },
    end: {
      line: last.loc.end.line,
      column: last.loc.end.column,
    },
  };
};

module.exports = {
  meta: {
    docs: {
      url:
        'https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/valid-describe.md',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (isDescribe(node)) {
          const callbackFunction = node.arguments[1];
          if (callbackFunction && isFunction(callbackFunction)) {
            if (isAsync(callbackFunction)) {
              context.report({
                message: 'No async describe callback',
                node: callbackFunction,
              });
            }
            if (hasParams(callbackFunction)) {
              context.report({
                message: 'Unexpected argument(s) in describe callback',
                loc: paramsLocation(callbackFunction.params),
              });
            }
            callbackFunction.body.body.forEach(node => {
              if (node.type === 'ReturnStatement') {
                context.report({
                  message: 'Unexpected return statement in describe callback',
                  node: node,
                });
              }
            });
          }
        }
      },
    };
  },
};
