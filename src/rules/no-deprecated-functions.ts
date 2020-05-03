import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, getNodeName } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow use of deprecated functions',
      recommended: false,
    },
    messages: {
      deprecatedFunction:
        '`{{ deprecation }}` has been deprecated in favor of `{{ replacement }}`',
    },
    type: 'suggestion',
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const deprecations: Record<string, string> = {
      'require.requireMock': 'jest.requireMock',
      'require.requireActual': 'jest.requireActual',
      'jest.addMatchers': 'expect.extend',
      'jest.resetModuleRegistry': 'jest.resetModules',
      'jest.runTimersToTime': 'jest.advanceTimersByTime',
    };

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const deprecation = getNodeName(node);

        if (!deprecation || !(deprecation in deprecations)) {
          return;
        }

        const replacement = deprecations[deprecation];
        const { callee } = node;

        context.report({
          messageId: 'deprecatedFunction',
          data: {
            deprecation,
            replacement,
          },
          node,
          fix(fixer) {
            let [name, func] = replacement.split('.');

            if (callee.property.type === AST_NODE_TYPES.Literal) {
              func = `'${func}'`;
            }

            return [
              fixer.replaceText(callee.object, name),
              fixer.replaceText(callee.property, func),
            ];
          },
        });
      },
    };
  },
});
