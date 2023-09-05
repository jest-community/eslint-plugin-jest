import type { TSESTree } from '@typescript-eslint/utils';
import { createRule, getNodeName, parseJestFnCall } from './utils';

interface ErrorType {
  messageId: 'globalSetTimeout' | 'multipleSetTimeouts' | 'orderSetTimeout';
  node: TSESTree.Node;
}

function isJestSetTimeout(node: TSESTree.Node) {
  return getNodeName(node) === 'jest.setTimeout';
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow using confusing setTimeout in test',
      recommended: false,
    },
    messages: {
      globalSetTimeout: '`jest.setTimeout` should be call in `global` scope.',
      multipleSetTimeouts:
        'Do not call `jest.setTimeout` multiple times, as only the last call will have an effect.',
      orderSetTimeout:
        '`jest.setTimeout` should be placed before any other jest methods',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const errors: ErrorType[] = [];
    let callJestTimeout = 0;
    let nonJestTimeout = 0;

    return {
      CallExpression(node) {
        const scope = context.getScope();
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) return;

        if (
          jestFnCall.type === 'describe' ||
          jestFnCall.type === 'test' ||
          jestFnCall.type === 'expect' ||
          jestFnCall.type === 'hook' ||
          (jestFnCall.type === 'jest' && !isJestSetTimeout(node))
        ) {
          nonJestTimeout += 1;
        }

        if (isJestSetTimeout(node)) {
          if (!['global', 'module'].includes(scope.type)) {
            errors.push({ messageId: 'globalSetTimeout', node });
          }

          if (nonJestTimeout > 0) {
            errors.push({ messageId: 'orderSetTimeout', node });
          }

          if (callJestTimeout >= 1) {
            errors.push({ messageId: 'multipleSetTimeouts', node });
          } else {
            callJestTimeout += 1;
          }
        }
      },
      'CallExpression:exit'() {
        while (errors.length > 0) {
          const error = errors.shift();

          if (error) {
            context.report(error);
          }
        }
      },
    };
  },
});
