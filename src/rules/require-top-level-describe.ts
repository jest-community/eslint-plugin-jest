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
      unexpectedMethod: 'All test cases must be wrapped in a describe block.',
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

        if (
          (numberOfDescribeBlocks === 0 && isTestCase(node)) ||
          isHook(node)
        ) {
          context.report({ node, messageId: 'unexpectedMethod' });
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
