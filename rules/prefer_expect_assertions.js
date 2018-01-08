'use strict';

const ruleMsg =
  'Every test should have either `expect.assertions(<number of assertions>)` or `expect.hasAssertions()` as its first expression';

const validateArguments = expression => {
  try {
    return (
      expression.arguments.length === 1 &&
      Number.isInteger(expression.arguments[0].value)
    );
  } catch (e) {
    return false;
  }
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

const getTestFunctionFirstLine = node => {
  try {
    return node.arguments[1].body.body[0].expression;
  } catch (e) {
    return undefined;
  }
};

const isFirstLineExprStmt = node => {
  try {
    return node.arguments[1].body.body[0].type === 'ExpressionStatement';
  } catch (e) {
    return false;
  }
};

const reportMsg = (context, node) => {
  context.report({
    message: ruleMsg,
    node,
  });
};

module.exports = context => {
  return {
    CallExpression(node) {
      if (isTestOrItFunction(node)) {
        if (!isFirstLineExprStmt(node)) {
          reportMsg(context, node);
        } else {
          const testFuncFirstLine = getTestFunctionFirstLine(node);
          if (!isExpectAssertionsOrHasAssertionsCall(testFuncFirstLine)) {
            reportMsg(context, node);
          }
        }
      }
    },
  };
};
