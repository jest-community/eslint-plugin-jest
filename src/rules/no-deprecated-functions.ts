import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  type EslintPluginJestRuleContext,
  createRule,
  getJestVersion,
  getNodeName,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow use of deprecated functions',
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
    // If jest version is not detected, assume latest
    const jestVersion =
      getJestVersion(context as EslintPluginJestRuleContext) || Infinity;

    const deprecations: Record<string, string> = {
      ...(jestVersion >= 15 && {
        'jest.resetModuleRegistry': 'jest.resetModules',
      }),
      ...(jestVersion >= 17 && {
        'jest.addMatchers': 'expect.extend',
      }),
      ...(jestVersion >= 21 && {
        'require.requireMock': 'jest.requireMock',
        'require.requireActual': 'jest.requireActual',
      }),
      ...(jestVersion >= 22 && {
        'jest.runTimersToTime': 'jest.advanceTimersByTime',
      }),
      ...(jestVersion >= 26 && {
        'jest.genMockFromModule': 'jest.createMockFromModule',
      }),
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
