import { getDocsUrl, testCaseNames, getNodeName, isTestCase } from './util';

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
      noIf: [
        'Tests should not contain if statements.',
        'This is usually an indication that you',
        'are attempting to test too much at once',
        'or not testing what you intend to.',
        'Consider breaking the if statement out',
        'into a separate test to resolve this error.',
      ].join(' '),
      noConditional: [
        'Tests should not contain conditional statements.',
        'This is usually an indication that you',
        'are attempting to test too much at once',
        'or not testing what you intend to.',
        'Consider writing a separate test for',
        'each fork in the conditional statement.',
        'If your conditionals are required to',
        'satisfy the typescript type checker, consider',
        'using a non-null assertion operator (!) instead.',
      ].join(' '),
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
