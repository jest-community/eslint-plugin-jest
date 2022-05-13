import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  KnownCallExpression,
  createRule,
  getTestCallExpressionsFromDeclaredVariables,
  isExpectCall,
  isSupportedAccessor,
  isTestCaseCall,
} from './utils';

const isCatchCall = (
  node: TSESTree.CallExpression,
): node is KnownCallExpression<'catch'> =>
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(node.callee.property, 'catch');

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Prevent calling `expect` conditionally',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      conditionalExpect: 'Avoid calling `expect` conditionally`',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const scope = context.getScope();
    let conditionalDepth = 0;
    let inTestCase = false;
    let inPromiseCatch = false;

    const increaseConditionalDepth = () => inTestCase && conditionalDepth++;
    const decreaseConditionalDepth = () => inTestCase && conditionalDepth--;

    return {
      FunctionDeclaration(node) {
        const declaredVariables = context.getDeclaredVariables(node);
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(
          declaredVariables,
          scope,
        );

        if (testCallExpressions.length > 0) {
          inTestCase = true;
        }
      },
      CallExpression(node: TSESTree.CallExpression) {
        if (isTestCaseCall(node, scope)) {
          inTestCase = true;
        }

        if (isCatchCall(node)) {
          inPromiseCatch = true;
        }

        if (inTestCase && isExpectCall(node) && conditionalDepth > 0) {
          context.report({
            messageId: 'conditionalExpect',
            node,
          });
        }

        if (inPromiseCatch && isExpectCall(node)) {
          context.report({
            messageId: 'conditionalExpect',
            node,
          });
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCaseCall(node, scope)) {
          inTestCase = false;
        }

        if (isCatchCall(node)) {
          inPromiseCatch = false;
        }
      },
      CatchClause: increaseConditionalDepth,
      'CatchClause:exit': decreaseConditionalDepth,
      IfStatement: increaseConditionalDepth,
      'IfStatement:exit': decreaseConditionalDepth,
      SwitchStatement: increaseConditionalDepth,
      'SwitchStatement:exit': decreaseConditionalDepth,
      ConditionalExpression: increaseConditionalDepth,
      'ConditionalExpression:exit': decreaseConditionalDepth,
      LogicalExpression: increaseConditionalDepth,
      'LogicalExpression:exit': decreaseConditionalDepth,
    };
  },
});
