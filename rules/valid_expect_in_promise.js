'use strict';

const reportMsg =
  'Promise should be returned to test its fulfillment or rejection';

const isThenOrCatch = node => {
  return (
    node.property &&
    (node.property.name == 'then' || node.property.name == 'catch')
  );
};

const isFunction = type => {
  return type == 'FunctionExpression' || type == 'ArrowFunctionExpression';
};

const isBodyCallExpression = argumentBody => {
  try {
    return argumentBody.body[0].expression.type == 'CallExpression';
  } catch (e) {
    return false;
  }
};

const isExpectCall = calleeObject => {
  try {
    return calleeObject.callee.name == 'expect';
  } catch (e) {
    return false;
  }
};

const reportReturnRequired = (context, node) => {
  context.report({
    loc: {
      end: {
        column: node.parent.parent.loc.end.column,
        line: node.parent.parent.loc.end.line,
      },
      start: node.parent.parent.loc.start,
    },
    message: reportMsg,
    node,
  });
};

const isPromiseReturnedLater = node => {
  if (node.parent.parent.type === 'ExpressionStatement') {
    const promiseName = node.parent.parent.expression.callee.object.name;
    const testFuncBody = node.parent.parent.parent.body;
    const lastLineInTestFunc = testFuncBody[testFuncBody.length - 1];
    return (
      lastLineInTestFunc.type === 'ReturnStatement' &&
      lastLineInTestFunc.argument.name === promiseName
    );
  }
};

const isParentThenOrReturn = node => {
  return (
    node.parent.parent.type == 'ReturnStatement' ||
    isThenOrCatch(node.parent.parent) ||
    isPromiseReturnedLater(node)
  );
};

const verifyExpectWithReturn = (argument, node, context) => {
  if (
    argument &&
    isFunction(argument.type) &&
    isBodyCallExpression(argument.body)
  ) {
    const calleeInThenOrCatch = argument.body.body[0].expression.callee.object;
    if (isExpectCall(calleeInThenOrCatch)) {
      if (!isParentThenOrReturn(node)) {
        reportReturnRequired(context, node);
      }
    }
  }
};

const isAwaitExpression = node => {
  return node.parent.parent && node.parent.parent.type == 'AwaitExpression';
};

module.exports = context => {
  return {
    MemberExpression(node) {
      if (
        node.type == 'MemberExpression' &&
        isThenOrCatch(node) &&
        node.parent.type == 'CallExpression' &&
        !isAwaitExpression(node)
      ) {
        const parent = node.parent;
        const arg1 = parent.arguments[0];
        const arg2 = parent.arguments[1];

        // then block can have two args, fulfillment & rejection
        // then block can have one args, fulfillment
        // catch block can have one args, rejection
        // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
        verifyExpectWithReturn(arg1, node, context);
        verifyExpectWithReturn(arg2, node, context);
      }
    },
  };
};
