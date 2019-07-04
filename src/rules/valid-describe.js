'use strict';

const { getDocsUrl, isDescribe, isFunction } = require('./util');

const isAsync = node => node.async;

const isString = node =>
  (node.type === 'Literal' && typeof node.value === 'string') ||
  node.type === 'TemplateLiteral';

const hasParams = node => node.params.length > 0;

const paramsLocation = params => {
  const [first] = params;
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
      url: getDocsUrl(__filename),
    },
    messages: {
      nameAndCallback: 'Describe requires name and callback arguments',
      firstArgumentMustBeName: 'First argument must be name',
      secondArgumentMustBeFunction: 'Second argument must be function',
      noAsyncDescribeCallback: 'No async describe callback',
      unexpectedDescribeArgument: 'Unexpected argument(s) in describe callback',
      unexpectedReturnInDescribe:
        'Unexpected return statement in describe callback',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (isDescribe(node)) {
          if (node.arguments.length === 0) {
            return context.report({
              messageId: 'nameAndCallback',
              loc: node.loc,
            });
          }

          const [name] = node.arguments;
          const [, callbackFunction] = node.arguments;
          if (!isString(name)) {
            context.report({
              messageId: 'firstArgumentMustBeName',
              loc: paramsLocation(node.arguments),
            });
          }
          if (callbackFunction === undefined) {
            context.report({
              messageId: 'nameAndCallback',
              loc: paramsLocation(node.arguments),
            });

            return;
          }
          if (!isFunction(callbackFunction)) {
            context.report({
              messageId: 'secondArgumentMustBeFunction',
              loc: paramsLocation(node.arguments),
            });

            return;
          }
          if (isAsync(callbackFunction)) {
            context.report({
              messageId: 'noAsyncDescribeCallback',
              node: callbackFunction,
            });
          }
          if (hasParams(callbackFunction)) {
            context.report({
              messageId: 'unexpectedDescribeArgument',
              loc: paramsLocation(callbackFunction.params),
            });
          }
          if (callbackFunction.body.type === 'BlockStatement') {
            callbackFunction.body.body.forEach(node => {
              if (node.type === 'ReturnStatement') {
                context.report({
                  messageId: 'unexpectedReturnInDescribe',
                  node,
                });
              }
            });
          }
        }
      },
    };
  },
};
