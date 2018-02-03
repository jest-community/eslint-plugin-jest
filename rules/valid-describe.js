'use strict';

const describeAliases = Object.assign(Object.create(null), {
  describe: true,
  'describe.only': true,
  'describe.skip': true,
  fdescribe: true,
  xdescribe: true,
});

const getNodeName = node => {
  if (node.type === 'MemberExpression') {
    return node.object.name + '.' + node.property.name;
  }
  return node.name;
};

const isDescribe = node =>
  node.type === 'CallExpression' && describeAliases[getNodeName(node.callee)];

const isFunction = node =>
  node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';

const isAsync = node => node.async;

const hasParams = node => node.params.length > 0;

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
        if (node && isDescribe(node)) {
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
                message: 'Unexpected argument in describe callback',
                node: callbackFunction.params[0],
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
