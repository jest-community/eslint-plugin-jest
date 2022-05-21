import {
  createRule,
  getStringValue,
  isDescribeCall,
  isStringNode,
  isSupportedAccessor,
  parseJestFnCall_1,
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
    const contexts = [newDescribeContext()];

    return {
      CallExpression(node) {
        const scope = context.getScope();
        const currentLayer = contexts[contexts.length - 1];

        const jestFnCall = parseJestFnCall_1(node, scope);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.type === 'describe') {
          contexts.push(newDescribeContext());
        }

        if (jestFnCall.members.find(s => isSupportedAccessor(s, 'each'))) {
          return;
        }

        const [argument] = node.arguments;

        if (!argument || !isStringNode(argument)) {
          return;
        }

        const title = getStringValue(argument);

        if (jestFnCall.type === 'test') {
          if (currentLayer.testTitles.includes(title)) {
            context.report({
              messageId: 'multipleTestTitle',
              node: argument,
            });
          }
          currentLayer.testTitles.push(title);
        }

        if (jestFnCall.type !== 'describe') {
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
        if (isDescribeCall(node, context.getScope())) {
          contexts.pop();
        }
      },
    };
  },
});
