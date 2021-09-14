import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, getNodeName } from './utils';

interface ContextSettings {
  jest?: EslintPluginJestSettings;
}

export type JestVersion =
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | number;

interface EslintPluginJestSettings {
  version: JestVersion | string;
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow use of deprecated functions',
      recommended: 'error',
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
    let jestVersion = (context.settings as ContextSettings)?.jest?.version;

    if (typeof jestVersion === 'string') {
      const [majorVersion] = jestVersion.split('.');

      jestVersion = parseInt(majorVersion, 10);

      if (Number.isNaN(jestVersion)) {
        jestVersion = undefined;
      }
    }

    if (typeof jestVersion !== 'number') {
      throw new Error(
        'Jest version not provided through settings - see https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-deprecated-functions.md#jest-version',
      );
    }

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
