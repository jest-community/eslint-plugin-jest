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

export default createRule<
  [
    Partial<{
      moduleFileExtensions: readonly string[];
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
      invalidMockModulePath: 'Module path {{ moduleName }} does not exist',
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
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      moduleFileExtensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
    },
  ],
  create(
    context,
    [{ moduleFileExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json'] }],
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

        try {
          if (!moduleName.value.startsWith('.')) {
            require.resolve(moduleName.value);

            return;
          }

          const resolvedModulePath = path.resolve(
            path.dirname(context.filename),
            moduleName.value,
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
          if (castedErr.code !== 'MODULE_NOT_FOUND') {
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
