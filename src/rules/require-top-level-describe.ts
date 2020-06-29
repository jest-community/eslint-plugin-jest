import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule, isDescribe, isHook, isTestCase } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Prevents test cases and hooks to be outside of a describe block',
      recommended: false,
    },
    messages: {
      unexpectedTestCase: 'All test cases must be wrapped in a describe block.',
      unexpectedHook: 'All hooks must be wrapped in a describe block.',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let numberOfDescribeBlocks = 0;

    return {
      CallExpression(node) {
        if (isDescribe(node)) {
          numberOfDescribeBlocks++;

          return;
        }

        if (numberOfDescribeBlocks === 0) {
          if (isTestCase(node)) {
            context.report({ node, messageId: 'unexpectedTestCase' });

            return;
          }

          if (isHook(node)) {
            context.report({ node, messageId: 'unexpectedHook' });

            return;
          }
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (isDescribe(node)) {
          numberOfDescribeBlocks--;
        }
      },
    };
  },
});
