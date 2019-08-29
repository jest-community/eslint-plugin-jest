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
      unexpectedMethod: 'There must be a top-level describe block.',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let numberOfDescribeBlock = 0;
    return {
      CallExpression(node) {
        isDescribe(node) && numberOfDescribeBlock++;
        if ((isTestCase(node) || isHook(node)) && numberOfDescribeBlock === 0) {
          context.report({ node, messageId: 'unexpectedMethod' });
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (isDescribe(node)) {
          numberOfDescribeBlock--;
        }
      },
    };
  },
});
