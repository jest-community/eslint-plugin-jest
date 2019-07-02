'use strict';

const { getDocsUrl, isFunction } = require('./util');

const isThenOrCatch = node => {
  return (
    node.property &&
    (node.property.name === 'then' || node.property.name === 'catch')
  );
};

const isExpectCallPresentInFunction = body => {
  if (body.type === 'BlockStatement') {
    return body.body.find(line => {
      if (line.type === 'ExpressionStatement')
        return isExpectCall(line.expression);
      if (line.type === 'ReturnStatement') return isExpectCall(line.argument);
    });
  } else {
    return isExpectCall(body);
  }
};

const isExpectCall = expression => {
  return (
    expression &&
    expression.type === 'CallExpression' &&
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
    messageId: 'returnPromise',
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

const getFunctionBody = func => {
  if (func.body.type === 'BlockStatement') return func.body.body;
  return func.body; //arrow-short-hand-fn
};

const getTestFunction = node => {
  let { parent } = node;
  while (parent) {
    if (isFunction(parent) && isTestFunc(parent.parent)) {
      return parent;
    }
    parent = parent.parent;
  }
};

const isParentThenOrPromiseReturned = (node, testFunctionBody) => {
  return (
    testFunctionBody.type === 'CallExpression' ||
    testFunctionBody.type === 'NewExpression' ||
    node.parent.parent.type === 'ReturnStatement' ||
    isPromiseReturnedLater(node, testFunctionBody) ||
    isThenOrCatch(node.parent.parent)
  );
};

const verifyExpectWithReturn = (
  promiseCallbacks,
  node,
  context,
  testFunctionBody,
) => {
  promiseCallbacks.some(promiseCallback => {
    if (promiseCallback && isFunction(promiseCallback)) {
      if (
        isExpectCallPresentInFunction(promiseCallback.body) &&
        !isParentThenOrPromiseReturned(node, testFunctionBody)
      ) {
        reportReturnRequired(context, node);
        return true;
      }
    }
  });
};

const isAwaitExpression = node => {
  return node.parent.parent && node.parent.parent.type === 'AwaitExpression';
};

const isHavingAsyncCallBackParam = testFunction => {
  try {
    return testFunction.params[0].type === 'Identifier';
  } catch (e) {
    return false;
  }
};

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      returnPromise:
        'Promise should be returned to test its fulfillment or rejection',
    },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.type === 'MemberExpression' &&
          isThenOrCatch(node) &&
          node.parent.type === 'CallExpression' &&
          !isAwaitExpression(node)
        ) {
          const testFunction = getTestFunction(node);
          if (testFunction && !isHavingAsyncCallBackParam(testFunction)) {
            const testFunctionBody = getFunctionBody(testFunction);
            const [
              fulfillmentCallback,
              rejectionCallback,
            ] = node.parent.arguments;

            // then block can have two args, fulfillment & rejection
            // then block can have one args, fulfillment
            // catch block can have one args, rejection
            // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
            verifyExpectWithReturn(
              [fulfillmentCallback, rejectionCallback],
              node,
              context,
              testFunctionBody,
            );
          }
        }
      },
    };
  },
};
