import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule, isExpectCall, isTestCase } from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Prefer using toThrow for exception tests',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noTryExpect: [
        'Tests should use Jest‘s exception helpers.',
        'Use "expect(() => yourFunction()).toThrow()" for synchronous tests,',
        'or "await expect(yourFunction()).rejects.toThrow()" for async tests',
      ].join(' '),
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let isTest = false;
    let catchDepth = 0;

    function isThrowExpectCall(node: TSESTree.CallExpression) {
      return catchDepth > 0 && isExpectCall(node);
    }

    return {
      CallExpression(node) {
        if (isTestCase(node)) {
          isTest = true;
        } else if (isTest && isThrowExpectCall(node)) {
          context.report({
            messageId: 'noTryExpect',
            node,
          });
        }
      },
      CatchClause() {
        if (isTest) {
          ++catchDepth;
        }
      },
      'CatchClause:exit'() {
        if (isTest) {
          --catchDepth;
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCase(node)) {
          isTest = false;
        }
      },
    };
  },
});
