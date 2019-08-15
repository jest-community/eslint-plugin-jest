import { createRule, isFunction, isTestCase } from './utils';
import { TSESTree } from '@typescript-eslint/experimental-utils';

const RETURN_STATEMENT = 'ReturnStatement';
const BLOCK_STATEMENT = 'BlockStatement';

const getBody = (args: TSESTree.Expression[]) => {
  const [, secondArg] = args;

  if (
    secondArg &&
    isFunction(secondArg) &&
    secondArg.body &&
    secondArg.body.type === BLOCK_STATEMENT
  ) {
    return secondArg.body.body;
  }
  return [];
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow explicitly returning from tests',
      recommended: false,
    },
    messages: {
      noReturnValue: 'Jest tests should not return a value.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
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
});
