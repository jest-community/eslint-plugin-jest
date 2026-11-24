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

function hasModulePath(
  modulePath: string,
  extensions: readonly string[],
): boolean {
  return ['', ...extensions].some(ext => {
    try {
      statSync(`${modulePath}${ext}`);

      return true;
    } catch {
      return false;
    }
  });
}

function resolvesModule(
  moduleName: string,
  basedir: string,
  extensions: readonly string[],
  mapped = false,
): boolean {
  try {
    if (moduleName.startsWith('.') || (mapped && path.isAbsolute(moduleName))) {
      return hasModulePath(path.resolve(basedir, moduleName), extensions);
    }

    require.resolve(moduleName, mapped ? { paths: [basedir] } : undefined);

    return true;
  } catch (err: unknown) {
    const { code } = err as { code: string };

    if (
      code !== 'MODULE_NOT_FOUND' &&
      code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED'
    ) {
      throw new Error(
        `Error when trying to validate mock module path from \`jest.mock\`: ${err}`,
      );
    }

    return false;
  }
}

export default createRule<
  [
    Partial<{
      moduleFileExtensions: readonly string[];
      moduleNameMapper: Readonly<Record<string, string | readonly string[]>>;
      rootDir: string;
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
          moduleNameMapper: {
            type: 'object',
            additionalProperties: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
              ],
            },
          },
          rootDir: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      moduleFileExtensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
      moduleNameMapper: {},
    },
  ],
  create(
    context,
    [
      {
        moduleFileExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json'],
        moduleNameMapper = {},
        rootDir = context.cwd,
      },
    ],
  ) {
    const mappings = Object.entries(moduleNameMapper).map(
      ([pattern, targets]) => ({
        // eslint-disable-next-line require-unicode-regexp -- Jest uses unflagged patterns.
        pattern: new RegExp(pattern),
        targets: (typeof targets === 'string' ? [targets] : targets).map(
          target =>
            target.startsWith('<rootDir>')
              ? path.resolve(
                  context.cwd,
                  rootDir,
                  `./${target.slice('<rootDir>'.length)}`,
                )
              : target,
        ),
      }),
    );
    const basedir = path.dirname(context.filename);

    function moduleExists(moduleName: string): boolean {
      for (const { pattern, targets } of mappings) {
        const match = pattern.exec(moduleName);

        if (match) {
          // Jest only tries the targets of the first matching pattern.
          return targets.some(target => {
            const mapped = target.replaceAll(
              /\$(\d+)/gu,
              (_, index) => match[Number(index)] || '',
            );

            return resolvesModule(mapped, basedir, moduleFileExtensions, true);
          });
        }
      }

      return resolvesModule(moduleName, basedir, moduleFileExtensions);
    }

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

        if (moduleExists(moduleName.value)) {
          return;
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
