import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  TestCaseName,
  createRule,
  getAccessorValue,
  getDeclaredVariables,
  getNodeName,
  getTestCallExpressionsFromDeclaredVariables,
  parseJestFnCall,
} from './utils';

const testCaseNames = new Set<string | null>([
  ...Object.keys(TestCaseName),
  'it.only',
  'it.only',
  'it.skip',
  'it.skip',
  'test.only',
  'test.only',
  'test.skip',
  'test.skip',
  'fit.concurrent',
]);

const isTestFunctionExpression = (
  node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
) =>
  node.parent !== undefined &&
  node.parent.type === AST_NODE_TYPES.CallExpression &&
  testCaseNames.has(getNodeName(node.parent.callee));

const conditionName = {
  [AST_NODE_TYPES.ConditionalExpression]: 'conditional',
  [AST_NODE_TYPES.SwitchStatement]: 'switch',
  [AST_NODE_TYPES.IfStatement]: 'if',
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow conditional logic',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      conditionalInTest: 'Test should not contain {{ condition }} statements',
    },
    deprecated: true,
    replacedBy: ['no-conditional-in-test'],
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const stack: boolean[] = [];

    function validate(
      node:
        | TSESTree.ConditionalExpression
        | TSESTree.SwitchStatement
        | TSESTree.IfStatement,
    ) {
      const lastElementInStack = stack[stack.length - 1];

      if (stack.length === 0 || !lastElementInStack) {
        return;
      }

      context.report({
        data: { condition: conditionName[node.type] },
        messageId: 'conditionalInTest',
        node,
      });
    }

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type === 'test') {
          stack.push(true);

          if (jestFnCall.members.some(s => getAccessorValue(s) === 'each')) {
            stack.push(true);
          }
        }
      },
      FunctionExpression(node) {
        stack.push(isTestFunctionExpression(node));
      },
      FunctionDeclaration(node) {
        const declaredVariables = getDeclaredVariables(context, node);
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(
          declaredVariables,
          context,
        );

        stack.push(testCallExpressions.length > 0);
      },
      ArrowFunctionExpression(node) {
        stack.push(isTestFunctionExpression(node));
      },
      IfStatement: validate,
      SwitchStatement: validate,
      ConditionalExpression: validate,
      'CallExpression:exit'() {
        stack.pop();
      },
      'FunctionExpression:exit'() {
        stack.pop();
      },
      'FunctionDeclaration:exit'() {
        stack.pop();
      },
      'ArrowFunctionExpression:exit'() {
        stack.pop();
      },
    };
  },
});
