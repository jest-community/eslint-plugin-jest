'use strict';

const getDocsUrl = require('./util').getDocsUrl;

const ruleMsg =
  'Every test should have either `expect.assertions(<number of assertions>)` or `expect.hasAssertions()` as its first expression';

const validateArguments = expression => {
  return (
    expression.arguments &&
    expression.arguments.length === 1 &&
    Number.isInteger(expression.arguments[0].value)
  );
};

const isExpectAssertionsOrHasAssertionsCall = expression => {
  try {
    const expectAssertionOrHasAssertionCall =
      expression.type === 'CallExpression' &&
      expression.callee.type === 'MemberExpression' &&
      expression.callee.object.name === 'expect' &&
      (expression.callee.property.name === 'assertions' ||
        expression.callee.property.name === 'hasAssertions');

    if (expression.callee.property.name === 'assertions') {
      return expectAssertionOrHasAssertionCall && validateArguments(expression);
    }
    return expectAssertionOrHasAssertionCall;
  } catch (e) {
    return false;
  }
};

const isTestOrItFunction = node => {
  return (
    node.type === 'CallExpression' &&
    node.callee &&
    (node.callee.name === 'it' || node.callee.name === 'test')
  );
};

const getFunctionFirstLine = functionBody => {
  return functionBody[0] && functionBody[0].expression;
};

const isFirstLineExprStmt = functionBody => {
  return functionBody[0] && functionBody[0].type === 'ExpressionStatement';
};

const getTestFunctionBody = node => {
  try {
    return node.arguments[1].body.body;
  } catch (e) {
    return undefined;
  }
};

const reportMsg = (context, node) => {
  context.report({
    message: ruleMsg,
    node,
  });
};

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (isTestOrItFunction(node)) {
          const testFuncBody = getTestFunctionBody(node);
          if (testFuncBody) {
            if (!isFirstLineExprStmt(testFuncBody)) {
              reportMsg(context, node);
            } else {
              const testFuncFirstLine = getFunctionFirstLine(testFuncBody);
              if (!isExpectAssertionsOrHasAssertionsCall(testFuncFirstLine)) {
                reportMsg(context, node);
              }
            }
          }
        }
      },
    };
  },
};
