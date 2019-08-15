import { TestCaseName, createRule, getNodeName, isTestCase } from './utils';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

const testCaseNames = new Set<string | null>([
  ...Object.keys(TestCaseName),
  'it.only',
  'it.skip',
  'test.only',
  'test.skip',
]);

const isTestArrowFunction = (node: TSESTree.ArrowFunctionExpression) =>
  node.parent !== undefined &&
  node.parent.type === AST_NODE_TYPES.CallExpression &&
  testCaseNames.has(getNodeName(node.parent.callee));

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow conditional logic',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noIf: 'Tests should not contain if statements.',
      noConditional: 'Tests should not contain conditional statements.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const stack: boolean[] = [];

    function validate(
      node: TSESTree.ConditionalExpression | TSESTree.IfStatement,
    ) {
      const lastElementInStack = stack[stack.length - 1];

      if (stack.length === 0 || lastElementInStack === false) {
        return;
      }

      const messageId =
        node.type === AST_NODE_TYPES.ConditionalExpression
          ? 'noConditional'
          : 'noIf';

      context.report({
        messageId,
        node,
      });
    }

    return {
      CallExpression(node) {
        stack.push(isTestCase(node));
      },
      FunctionExpression() {
        stack.push(false);
      },
      FunctionDeclaration() {
        stack.push(false);
      },
      ArrowFunctionExpression(node) {
        stack.push(isTestArrowFunction(node));
      },
      IfStatement: validate,
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
