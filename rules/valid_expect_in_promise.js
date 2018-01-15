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

const isExpectCallPresentInFunction = body => {
  if (body.type === 'BlockStatement') {
    return body.body.find(line => {
      return isExpectCall(line.expression);
    });
  } else {
    return isExpectCall(body);
  }
};

const isExpectCall = expression => {
  return (
    expression &&
    expression.type == 'CallExpression' &&
    expression.callee.type === 'MemberExpression' &&
    expression.callee.object.type === 'CallExpression' &&
    expression.callee.object.callee.name === 'expect'
  );
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

const isPromiseReturnedLater = (node, testFunctionBody) => {
  let promiseName;
  if (node.parent.parent.type === 'ExpressionStatement') {
    promiseName = node.parent.parent.expression.callee.object.name;
  } else if (node.parent.parent.type === 'VariableDeclarator') {
    promiseName = node.parent.parent.id.name;
  }
  const lastLineInTestFunc = testFunctionBody[testFunctionBody.length - 1];
  return (
    lastLineInTestFunc.type === 'ReturnStatement' &&
    lastLineInTestFunc.argument.name === promiseName
  );
};

const isTestFunc = node => {
  return (
    node.type === 'CallExpression' &&
    (node.callee.name === 'it' || node.callee.name === 'test')
  );
};

const getTestFuncBody = node => {
  let parent = node.parent;
  while (parent) {
    if (isFunction(parent.type) && isTestFunc(parent.parent)) {
      if (parent.body.type === 'BlockStatement') return parent.body.body;
      if (parent.body.type === 'CallExpression')
        //arrow-short-hand-fn
        return parent.body;
    }
    parent = parent.parent;
  }
};

const isParentThenOrPromiseReturned = (node, testFunctionBody) => {
  return (
    testFunctionBody.type == 'CallExpression' ||
    node.parent.parent.type == 'ReturnStatement' ||
    isPromiseReturnedLater(node, testFunctionBody) ||
    isThenOrCatch(node.parent.parent)
  );
};

const verifyExpectWithReturn = (argument, node, context, testFunctionBody) => {
  if (argument && isFunction(argument.type)) {
    if (isExpectCallPresentInFunction(argument.body)) {
      if (!isParentThenOrPromiseReturned(node, testFunctionBody)) {
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
        const testFunctionBody = getTestFuncBody(node);
        if (testFunctionBody) {
          const parent = node.parent;
          const arg1 = parent.arguments[0];
          const arg2 = parent.arguments[1];

          // then block can have two args, fulfillment & rejection
          // then block can have one args, fulfillment
          // catch block can have one args, rejection
          // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
          verifyExpectWithReturn(arg1, node, context, testFunctionBody);
          verifyExpectWithReturn(arg2, node, context, testFunctionBody);
        }
      }
    },
  };
};
