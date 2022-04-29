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
      category: 'Best Practices',
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
    const scope = context.getScope();
    const contexts = [newDescribeContext()];

    return {
      CallExpression(node) {
        const currentLayer = contexts[contexts.length - 1];

        if (isDescribeCall(node, scope)) {
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

        if (isTestCaseCall(node, scope)) {
          if (currentLayer.testTitles.includes(title)) {
            context.report({
              messageId: 'multipleTestTitle',
              node: argument,
            });
          }
          currentLayer.testTitles.push(title);
        }

        if (!isDescribeCall(node, scope)) {
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
        if (isDescribeCall(node, scope)) {
          contexts.pop();
        }
      },
    };
  },
});
