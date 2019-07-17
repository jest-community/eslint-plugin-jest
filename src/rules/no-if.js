import { getDocsUrl, getNodeName, isTestCase, testCaseNames } from './util';

const isTestArrowFunction = node =>
  node !== undefined &&
  node.type === 'ArrowFunctionExpression' &&
  node.parent.type === 'CallExpression' &&
  testCaseNames.has(getNodeName(node.parent.callee));

export default {
  meta: {
    docs: {
      description: 'Disallow conditional logic',
      category: 'Best Practices',
      recommended: false,
      uri: getDocsUrl('jest/no-if'),
    },
    messages: {
      noIf: 'Tests should not contain if statements.',
      noConditional: 'Tests should not contain conditional statements.',
    },
  },

  create(context) {
    const stack = [];

    function validate(node) {
      const lastElementInStack = stack[stack.length - 1];

      if (stack.length === 0 || lastElementInStack === false) {
        return;
      }

      const messageId =
        node.type === 'ConditionalExpression' ? 'noConditional' : 'noIf';

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
};
