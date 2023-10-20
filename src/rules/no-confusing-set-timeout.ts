import {
  type ParsedJestFnCall,
  createRule,
  getScope,
  isIdentifier,
  parseJestFnCall,
} from './utils';

function isJestSetTimeout(jestFnCall: ParsedJestFnCall) {
  return (
    jestFnCall.type === 'jest' &&
    jestFnCall.members.length === 1 &&
    isIdentifier(jestFnCall.members[0], 'setTimeout')
  );
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow confusing usages of jest.setTimeout',
      recommended: false,
    },
    messages: {
      globalSetTimeout: '`jest.setTimeout` should be call in `global` scope',
      multipleSetTimeouts:
        'Do not call `jest.setTimeout` multiple times, as only the last call will have an effect',
      orderSetTimeout:
        '`jest.setTimeout` should be placed before any other jest methods',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let seenJestTimeout = false;
    let shouldEmitOrderSetTimeout = false;

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (!isJestSetTimeout(jestFnCall)) {
          shouldEmitOrderSetTimeout = true;

          return;
        }

        if (!['global', 'module'].includes(getScope(context, node).type)) {
          context.report({ messageId: 'globalSetTimeout', node });
        }

        if (shouldEmitOrderSetTimeout) {
          context.report({ messageId: 'orderSetTimeout', node });
        }

        if (seenJestTimeout) {
          context.report({ messageId: 'multipleSetTimeouts', node });
        }

        seenJestTimeout = true;
      },
    };
  },
});
