import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  type KnownCallExpression,
  createRule,
  getTestCallExpressionsFromDeclaredVariables,
  isSupportedAccessor,
  isTypeOfJestFnCall,
  parseJestFnCall,
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
      description: 'Disallow calling `expect` conditionally',
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
    let inPromiseCatch = false;

    const increaseConditionalDepth = () => inTestCase && conditionalDepth++;
    const decreaseConditionalDepth = () => inTestCase && conditionalDepth--;

    return {
      FunctionDeclaration(node) {
        const declaredVariables = context.getDeclaredVariables(node);
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(
          declaredVariables,
          context,
        );

        if (testCallExpressions.length > 0) {
          inTestCase = true;
        }
      },
      CallExpression(node: TSESTree.CallExpression) {
        const { type: jestFnCallType } = parseJestFnCall(node, context) ?? {};

        if (jestFnCallType === 'test') {
          inTestCase = true;
        }

        if (isCatchCall(node)) {
          inPromiseCatch = true;
        }

        if (inTestCase && jestFnCallType === 'expect' && conditionalDepth > 0) {
          context.report({
            messageId: 'conditionalExpect',
            node,
          });
        }

        if (inPromiseCatch && jestFnCallType === 'expect') {
          context.report({
            messageId: 'conditionalExpect',
            node,
          });
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfJestFnCall(node, context, ['test'])) {
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
