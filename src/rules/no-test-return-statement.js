'use strict';

const { getDocsUrl, isFunction, isTestCase } = require('./util');

const RETURN_STATEMENT = 'ReturnStatement';
const BLOCK_STATEMENT = 'BlockStatement';

const getBody = args => {
  if (
    args.length > 1 &&
    isFunction(args[1]) &&
    args[1].body.type === BLOCK_STATEMENT
  ) {
    return args[1].body.body;
  }
  return [];
};

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      noReturnValue: 'Jest tests should not return a value.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestCase(node)) return;
        const body = getBody(node.arguments);
        const returnStmt = body.find(t => t.type === RETURN_STATEMENT);
        if (!returnStmt) return;

        context.report({ messageId: 'noReturnValue', node: returnStmt });
      },
    };
  },
};
