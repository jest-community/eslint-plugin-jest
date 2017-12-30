'use strict';

const reportMsg =
  'Promise should be returned to test its fulfillment or rejection';

const isThenOrCatch = node => {
  return node.property.name == 'then' || node.property.name == 'catch';
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

const verifyExpectWithReturn = (argument, node, context) => {
  if (
    argument &&
    isFunction(argument.type) &&
    //$FlowFixMe
    isBodyCallExpression(argument.body)
  ) {
    const calleeInThenOrCatch = argument.body.body[0].expression.callee.object;
    if (isExpectCall(calleeInThenOrCatch)) {
      if (node.parent.parent.type != 'ReturnStatement') {
        reportReturnRequired(context, node);
      }
    }
  }
};

module.exports = context => {
  return {
    MemberExpression(node) {
      if (
        node.type == 'MemberExpression' &&
        isThenOrCatch(node) &&
        node.parent.type == 'CallExpression'
      ) {
        const parent = node.parent;
        // $FlowFixMe
        const arg1 = parent.arguments[0];
        // $FlowFixMe
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
