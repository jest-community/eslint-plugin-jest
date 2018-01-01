'use strict';

const ruleMsg =
  'Every test should have expect.assertions({number of assertions}) as first expression';

const isValidArgument = expression => {
  try {
    return Number.isInteger(expression.arguments[0].value);
  } catch (e) {
    return false;
  }
};

const isExpectAssertionsCall = expression => {
  try {
    return (
      expression.type == 'CallExpression' &&
      expression.callee.type == 'MemberExpression' &&
      expression.callee.object.name == 'expect' &&
      expression.callee.property.name == 'assertions' &&
      isValidArgument(expression)
    );
  } catch (e) {
    return false;
  }
};

const isTestOrItFunction = node => {
  return (
    node.type == 'CallExpression' &&
    node.callee &&
    (node.callee.name == 'it' || node.callee.name == 'test')
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
    return node.arguments[1].body.body[0].type == 'ExpressionStatement';
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
          if (testFuncFirstLine && !isExpectAssertionsCall(testFuncFirstLine)) {
            reportMsg(context, node);
          }
        }
      }
    },
  };
};
