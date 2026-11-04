import { statSync } from 'fs';
import path from 'path';
import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  createRule,
  findModuleName,
  getAccessorValue,
  isSupportedAccessor,
  isTypeOfJestFnCall,
} from './utils';

function resolveAlias(
  moduleName: string,
  aliases: Readonly<Record<string, string>>,
): string | undefined {
  if (Object.hasOwn(aliases, moduleName)) {
    return aliases[moduleName];
  }

  for (const [alias, target] of Object.entries(aliases)) {
    if (
      alias.endsWith('/*') &&
      target.endsWith('*') &&
      moduleName.startsWith(alias.slice(0, -1))
    ) {
      return target.slice(0, -1) + moduleName.slice(alias.length - 1);
    }
  }

  return undefined;
}

export default createRule<
  [
    Partial<{
      moduleFileExtensions: readonly string[];
      aliases: Readonly<Record<string, string>>;
    }>,
  ],
  'invalidMockModulePath'
>({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mocking of non-existing module paths',
    },
    messages: {
      invalidMockModulePath:
        'Module path {{ moduleName }} does not exist or is not exported',
    },
    schema: [
      {
        type: 'object',
        properties: {
          moduleFileExtensions: {
            type: 'array',
            items: { type: 'string' },
            additionalItems: false,
          },
          aliases: {
            type: 'object',
            additionalProperties: { type: 'string', minLength: 1 },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      moduleFileExtensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
      aliases: {},
    },
  ],
  create(
    context,
    [
      {
        moduleFileExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json'],
        aliases = {},
      },
    ],
  ) {
    return {
      CallExpression(node: TSESTree.CallExpression): void {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        if (
          !node.arguments.length ||
          !isTypeOfJestFnCall(node, context, ['jest']) ||
          !(
            isSupportedAccessor(node.callee.property) &&
            ['mock', 'doMock'].includes(getAccessorValue(node.callee.property))
          )
        ) {
          return;
        }

        const moduleName = findModuleName(node.arguments[0]);

        if (!moduleName) {
          return;
        }

        if (node.arguments[2]?.type === AST_NODE_TYPES.ObjectExpression) {
          const hasTrueVirtualProperty = node.arguments[2].properties.some(
            expression => {
              if (expression.type === AST_NODE_TYPES.Property) {
                const { key, value } = expression;

                return (
                  isSupportedAccessor(key, 'virtual') &&
                  value.type === AST_NODE_TYPES.Literal &&
                  value.value
                );
              }

              return false;
            },
          );

          if (hasTrueVirtualProperty) {
            return;
          }
        }

        try {
          const aliasPath = resolveAlias(moduleName.value, aliases);

          if (aliasPath === undefined && !moduleName.value.startsWith('.')) {
            require.resolve(moduleName.value);

            return;
          }

          const resolvedModulePath = path.resolve(
            aliasPath === undefined
              ? path.dirname(context.filename)
              : context.cwd,
            aliasPath ?? moduleName.value,
          );

          const hasPossiblyModulePaths = ['', ...moduleFileExtensions].some(
            ext => {
              try {
                statSync(`${resolvedModulePath}${ext}`);

                return true;
              } catch {
                return false;
              }
            },
          );

          if (hasPossiblyModulePaths) {
            return;
          }
        } catch (err: unknown) {
          const castedErr = err as { code: string };

          // Reports unexpected issues when attempt to verify mocked module path.
          // The list of possible errors is non-exhaustive.
          if (
            castedErr.code !== 'MODULE_NOT_FOUND' &&
            castedErr.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED'
          ) {
            throw new Error(
              `Error when trying to validate mock module path from \`jest.mock\`: ${err}`,
            );
          }
        }

        context.report({
          messageId: 'invalidMockModulePath',
          data: { moduleName: moduleName.raw },
          node,
        });
      },
    };
  },
});
