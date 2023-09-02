import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import type { Scope } from '@typescript-eslint/utils/dist/ts-eslint';
import { createRule, getNodeName } from './utils';

interface ErrorType {
  messageId: 'globalSetTimeout' | 'onlyOneSetTimeout' | 'topSetTimeout';
  node: TSESTree.Node;
}

function isJestSetTimeout(node: TSESTree.Node) {
  if (node.type === AST_NODE_TYPES.ExpressionStatement) {
    return getNodeName(node.expression) === 'jest.setTimeout';
  }

  return getNodeName(node) === 'jest.setTimeout';
}

function checkIsGlobal(scope: Scope.Scope) {
  // for ESModule Case
  if (scope.type === 'module' && scope.upper.type === 'global') return true;
  if (scope.type === 'global') return true;

  return false;
}

function isTestsuiteFunction(node: TSESTree.Node) {
  if (node.type !== AST_NODE_TYPES.ExpressionStatement) return false;

  const name = getNodeName(node.expression);

  if (!name) return false;

  return [
    'describe',
    'test',
    'it',
    'beforeEach',
    'afterEach',
    'before',
    'after',
  ].includes(name);
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
      onlyOneSetTimeout: 'Only the last one `jest.setTimeout` call work.',
      topSetTimeout:
        'The `jest.setTimout` should be placed before all of testsuite methods.',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const errors: ErrorType[] = [];
    let jestTimeoutcount = 0;
    let nonJestTimeout = 0;

    return {
      Program(node) {
        const { body } = node;

        body.forEach((n, index) => {
          if (isJestSetTimeout(n)) {
            if (nonJestTimeout > 0) {
              errors.push({
                messageId: 'topSetTimeout',
                node: node.body[index],
              });
            }
          } else if (isTestsuiteFunction(n)) {
            nonJestTimeout += 1;
          }
        });
      },
      MemberExpression(node) {
        const scope = context.getScope();

        if (!isJestSetTimeout(node)) return;

        jestTimeoutcount += 1;

        if (!checkIsGlobal(scope)) {
          errors.push({ messageId: 'globalSetTimeout', node });
        }

        if (jestTimeoutcount > 1) {
          errors.push({ messageId: 'onlyOneSetTimeout', node });
        }
      },
      'Program:exit'() {
        if (errors.length > 0) {
          errors.forEach((error: ErrorType) => {
            context.report(error);
          });
        }
      },
    };
  },
});
