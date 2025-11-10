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

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mocking of non-existing module path',
    },
    messages: {
      invalidMockModulePath: 'Module path {{ moduleName }} does not exist',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression): void {
        const { callee } = node;

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const { property } = callee;

        if (
          !node.arguments.length ||
          !isTypeOfJestFnCall(node, context, ['jest']) ||
          !(
            isSupportedAccessor(property) &&
            ['mock', 'doMock'].includes(getAccessorValue(property))
          )
        ) {
          return;
        }

        const moduleName = findModuleName(node.arguments[0]);

        /* istanbul ignore if */
        if (!moduleName) {
          throw new Error(
            'Cannot parse mocked module name from `jest.mock` -  - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`',
          );
        }

        try {
          if (moduleName.value.startsWith('.')) {
            const resolvedModulePath = path.resolve(
              path.dirname(context.filename),
              moduleName.value,
            );

            const hasPossiblyModulePaths = ['', '.js', '.ts']
              .map(ext => `${resolvedModulePath}${ext}`)
              .some(modPath => {
                try {
                  statSync(modPath);

                  return true;
                } catch {
                  return false;
                }
              });

            if (!hasPossiblyModulePaths) {
              throw { code: 'MODULE_NOT_FOUND' };
            }
          } else {
            require.resolve(moduleName.value);
          }
        } catch (err: any) {
          // Skip over any unexpected issues when attempt to verify mocked module path.
          // The list of possible errors is non-exhaustive.
          /* istanbul ignore if */
          if (!['MODULE_NOT_FOUND', 'ENOENT'].includes(err.code)) {
            return;
          }

          context.report({
            messageId: 'invalidMockModulePath',
            data: { moduleName: moduleName.raw },
            node,
          });
        }
      },
    };
  },
});
