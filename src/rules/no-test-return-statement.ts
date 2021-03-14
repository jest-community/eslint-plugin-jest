import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getTestCallExpressionsFromDeclaredVariables,
  isFunction,
  isTestCaseCall,
} from './utils';

const getBody = (args: TSESTree.Expression[]) => {
  const [, secondArg] = args;

  if (
    secondArg &&
    isFunction(secondArg) &&
    secondArg.body.type === AST_NODE_TYPES.BlockStatement
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
        if (!isTestCaseCall(node)) return;
        const body = getBody(node.arguments);
        const returnStmt = body.find(
          t => t.type === AST_NODE_TYPES.ReturnStatement,
        );

        if (!returnStmt) return;

        context.report({ messageId: 'noReturnValue', node: returnStmt });
      },
      FunctionDeclaration(node) {
        const declaredVariables = context.getDeclaredVariables(node);
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(
          declaredVariables,
        );

        if (testCallExpressions.length === 0) return;

        const returnStmt = node.body.body.find(
          t => t.type === AST_NODE_TYPES.ReturnStatement,
        );

        if (!returnStmt) return;

        context.report({ messageId: 'noReturnValue', node: returnStmt });
      },
    };
  },
});
