import {
  createRule,
  getNodeName,
  getStringValue,
  isDescribeCall,
  isStringNode,
  isTestCaseCall,
} from './utils';

interface DescribeContext {
  describeTitles: string[];
  testTitles: string[];
}

const newDescribeContext = (): DescribeContext => ({
  describeTitles: [],
  testTitles: [],
});

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow identical titles',
      recommended: 'error',
    },
    messages: {
      multipleTestTitle:
        'Test title is used multiple times in the same describe block.',
      multipleDescribeTitle:
        'Describe block title is used multiple times in the same describe block.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const contexts = [newDescribeContext()];

    return {
      CallExpression(node) {
        const currentLayer = contexts[contexts.length - 1];

        if (isDescribeCall(node)) {
          contexts.push(newDescribeContext());
        }

        if (getNodeName(node.callee)?.endsWith('.each')) {
          return;
        }

        const [argument] = node.arguments;

        if (!argument || !isStringNode(argument)) {
          return;
        }

        const title = getStringValue(argument);

        if (isTestCaseCall(node)) {
          if (currentLayer.testTitles.includes(title)) {
            context.report({
              messageId: 'multipleTestTitle',
              node: argument,
            });
          }
          currentLayer.testTitles.push(title);
        }

        if (!isDescribeCall(node)) {
          return;
        }
        if (currentLayer.describeTitles.includes(title)) {
          context.report({
            messageId: 'multipleDescribeTitle',
            node: argument,
          });
        }
        currentLayer.describeTitles.push(title);
      },
      'CallExpression:exit'(node) {
        if (isDescribeCall(node)) {
          contexts.pop();
        }
      },
    };
  },
});
