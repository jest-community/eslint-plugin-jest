import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
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
  version: JestVersion;
}

let cachedJestVersion: JestVersion | null = null;

/** @internal */
export const _clearCachedJestVersion = () => (cachedJestVersion = null);

const detectJestVersion = (): JestVersion => {
  if (cachedJestVersion) {
    return cachedJestVersion;
  }

  try {
    const jestPath = require.resolve('jest/package.json', {
      paths: [process.cwd()],
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jestPackageJson = require(jestPath) as JSONSchemaForNPMPackageJsonFiles;

    if (jestPackageJson.version) {
      const [majorVersion] = jestPackageJson.version.split('.');

      return (cachedJestVersion = parseInt(majorVersion, 10));
    }
  } catch {}

  throw new Error(
    'Unable to detect Jest version - please ensure jest package is installed, or otherwise set version explicitly',
  );
};

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
    const jestVersion =
      (context.settings as ContextSettings)?.jest?.version ||
      detectJestVersion();

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
