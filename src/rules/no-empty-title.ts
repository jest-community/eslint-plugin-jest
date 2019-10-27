import {
  DescribeAlias,
  TestCaseName,
  createRule,
  isDescribe,
  isStringNode,
  isTestCase,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow empty titles',
      recommended: false,
    },
    messages: {
      describe: 'describe should not have an empty title',
      test: 'test should not have an empty title',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isDescribe(node) && !isTestCase(node)) {
          return;
        }
        const [argument] = node.arguments;
        if (!argument || !isStringNode(argument, '')) {
          return;
        }

        context.report({
          messageId: isDescribe(node)
            ? DescribeAlias.describe
            : TestCaseName.test,
          node: argument,
        });
      },
    };
  },
});
