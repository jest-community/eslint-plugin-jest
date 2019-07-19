import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { createRule, getNodeName, scopeHasLocalReference } from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow Jasmine globals',
      recommended: 'error',
    },
    messages: {
      illegalGlobal:
        'Illegal usage of global `{{ global }}`, prefer `{{ replacement }}`',
      illegalMethod:
        'Illegal usage of `{{ method }}`, prefer `{{ replacement }}`',
      illegalFail:
        'Illegal usage of `fail`, prefer throwing an error, or the `done.fail` callback',
      illegalPending:
        'Illegal usage of `pending`, prefer explicitly skipping a test using `test.skip`',
      illegalJasmine: 'Illegal usage of jasmine global',
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        const calleeName = getNodeName(callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression || !calleeName) {
          return;
        }

        if (
          calleeName === 'spyOn' ||
          calleeName === 'spyOnProperty' ||
          calleeName === 'fail' ||
          calleeName === 'pending'
        ) {
          if (scopeHasLocalReference(context.getScope(), calleeName)) {
            // It's a local variable, not a jasmine global.
            return;
          }

          switch (calleeName) {
            case 'spyOn':
            case 'spyOnProperty':
              context.report({
                node,
                messageId: 'illegalGlobal',
                data: { global: calleeName, replacement: 'jest.spyOn' },
              });
              break;
            case 'fail':
              context.report({ node, messageId: 'illegalFail' });
              break;
            case 'pending':
              context.report({ node, messageId: 'illegalPending' });
              break;
          }
          return;
        }

        if (calleeName.startsWith('jasmine.')) {
          const functionName = calleeName.replace('jasmine.', '');

          if (
            functionName === 'any' ||
            functionName === 'anything' ||
            functionName === 'arrayContaining' ||
            functionName === 'objectContaining' ||
            functionName === 'stringMatching'
          ) {
            context.report({
              fix(fixer) {
                return [fixer.replaceText(callee.object, 'expect')];
              },
              node,
              messageId: 'illegalMethod',
              data: {
                method: calleeName,
                replacement: `expect.${functionName}`,
              },
            });
            return;
          }

          if (functionName === 'addMatchers') {
            context.report({
              node,
              messageId: 'illegalMethod',
              data: {
                method: calleeName,
                replacement: `expect.extend`,
              },
            });
            return;
          }

          if (functionName === 'createSpy') {
            context.report({
              node,
              messageId: 'illegalMethod',
              data: {
                method: calleeName,
                replacement: 'jest.fn',
              },
            });
            return;
          }

          context.report({ node, messageId: 'illegalJasmine' });
        }
      },
      MemberExpression(node) {
        if ('name' in node.object && node.object.name === 'jasmine') {
          const { parent, property } = node;

          if (parent && parent.type === AST_NODE_TYPES.AssignmentExpression) {
            if (
              'name' in property &&
              property.name === 'DEFAULT_TIMEOUT_INTERVAL'
            ) {
              const { right } = parent;

              if (right.type !== AST_NODE_TYPES.Literal) {
                return;
              }

              context.report({
                fix: fixer => [
                  fixer.replaceText(parent, `jest.setTimeout(${right.value})`),
                ],
                node,
                messageId: 'illegalJasmine',
              });
              return;
            }

            context.report({ node, messageId: 'illegalJasmine' });
          }
        }
      },
    };
  },
});
