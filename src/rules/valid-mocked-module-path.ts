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
      invalidMockModulePath: 'Mocked module path {{moduleName}} does not exist',
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
          node.arguments.length >= 1 &&
          isTypeOfJestFnCall(node, context, ['jest']) &&
          isSupportedAccessor(property) &&
          ['mock', 'doMock'].includes(getAccessorValue(property))
        ) {
          const [nameNode] = node.arguments;
          const moduleName = findModuleName(nameNode);

          try {
            if (moduleName) {
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
            }
          } catch (err: any) {
            if (err?.code === 'MODULE_NOT_FOUND' || err?.code === 'ENOENT') {
              context.report({
                messageId: 'invalidMockModulePath',
                data: { moduleName: moduleName?.raw ?? './module-name' },
                node,
              });
            }
          }
        }
      },
    };
  },
});
