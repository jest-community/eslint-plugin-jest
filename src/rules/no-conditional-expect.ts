import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getTestCallExpressionsFromDeclaredVariables,
  isExpectCall,
  isTestCaseCall,
} from './utils';

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
    let conditionalDepth = 0;
    let inTestCase = false;

    const increaseConditionalDepth = () => inTestCase && conditionalDepth++;
    const decreaseConditionalDepth = () => inTestCase && conditionalDepth--;

    return {
      FunctionDeclaration(node) {
        const declaredVariables = context.getDeclaredVariables(node);
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(
          declaredVariables,
        );

        if (testCallExpressions.length > 0) {
          inTestCase = true;
        }
      },
      CallExpression(node: TSESTree.CallExpression) {
        if (isTestCaseCall(node)) {
          inTestCase = true;
        }

        if (inTestCase && isExpectCall(node) && conditionalDepth > 0) {
          context.report({
            messageId: 'conditionalExpect',
            node,
          });
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCaseCall(node)) {
          inTestCase = false;
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
