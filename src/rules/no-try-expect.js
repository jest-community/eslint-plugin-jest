import { getDocsUrl, isTestCase } from './util';

export default {
  meta: {
    docs: {
      description: 'Prefer using toThrow for exception tests',
      uri: getDocsUrl(__filename),
    },
    messages: {
      noTryExpect: [
        'Tests should use Jest‘s exception helpers.',
        'Use "expect(() => yourFunction()).toThrow()" for synchronous tests,',
        'or "await expect(yourFunction()).rejects.toThrow()" for async tests',
      ].join(' '),
    },
  },
  create(context) {
    let isTest = false;
    let catchDepth = 0;

    function isThrowExpectCall(node) {
      return catchDepth > 0 && node.callee.name === 'expect';
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
};
