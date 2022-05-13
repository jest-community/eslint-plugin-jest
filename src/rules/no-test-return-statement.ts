import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  createRule,
  getTestCallExpressionsFromDeclaredVariables,
  isFunction,
  isTestCaseCall,
} from './utils';

const getBody = (args: TSESTree.CallExpressionArgument[]) => {
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
    const scope = context.getScope();

    return {
      CallExpression(node) {
        if (!isTestCaseCall(node, scope)) return;
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
          scope,
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
