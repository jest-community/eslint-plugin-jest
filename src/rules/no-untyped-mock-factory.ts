import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  createRule,
  getAccessorValue,
  isFunction,
  isSupportedAccessor,
  isTypeOfJestFnCall,
} from './utils';

const findModuleName = (
  node: TSESTree.Literal | TSESTree.Node,
): TSESTree.StringLiteral | null => {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') {
    return node;
  }

  return null;
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Disallow using `jest.mock()` factories without an explicit type parameter',
      recommended: false,
    },
    messages: {
      addTypeParameterToModuleMock:
        'Add a type parameter to the mock factory such as `typeof import({{ moduleName }})`',
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression): void {
        const { callee, typeParameters } = node;

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const { property } = callee;

        if (
          node.arguments.length === 2 &&
          isTypeOfJestFnCall(node, context, ['jest']) &&
          isSupportedAccessor(property) &&
          ['mock', 'doMock'].includes(getAccessorValue(property))
        ) {
          const [nameNode, factoryNode] = node.arguments;

          const hasTypeParameter =
            typeParameters !== undefined && typeParameters.params.length > 0;
          const hasReturnType =
            isFunction(factoryNode) && factoryNode.returnType !== undefined;

          if (hasTypeParameter || hasReturnType) {
            return;
          }

          const moduleName = findModuleName(nameNode);

          context.report({
            messageId: 'addTypeParameterToModuleMock',
            data: { moduleName: moduleName?.raw ?? './module-name' },
            node,
            fix(fixer) {
              if (!moduleName) {
                return [];
              }

              return [
                fixer.insertTextAfter(
                  callee,
                  `<typeof import(${moduleName.raw})>`,
                ),
              ];
            },
          });
        }
      },
    };
  },
});
