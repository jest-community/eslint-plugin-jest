import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { createRule, followTypeAssertionChain } from './utils';

const mockTypes = ['Mock', 'MockedFunction', 'MockedClass', 'MockedObject'];

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Prefer `jest.mocked()` over `fn as jest.Mock`',
    },
    messages: {
      useJestMocked: 'Prefer `jest.mocked()`',
    },
    schema: [],
    type: 'suggestion',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    function check(node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion) {
      const { typeAnnotation } = node;

      if (typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
        return;
      }

      const { typeName } = typeAnnotation;

      if (typeName.type !== AST_NODE_TYPES.TSQualifiedName) {
        return;
      }

      const { left, right } = typeName;

      if (
        left.type !== AST_NODE_TYPES.Identifier ||
        right.type !== AST_NODE_TYPES.Identifier ||
        left.name !== 'jest' ||
        !mockTypes.includes(right.name)
      ) {
        return;
      }

      const fnName = context.sourceCode.text.slice(
        ...followTypeAssertionChain(node.expression).range,
      );

      context.report({
        node,
        messageId: 'useJestMocked',
        fix(fixer) {
          return fixer.replaceText(node, `jest.mocked(${fnName})`);
        },
      });
    }

    return {
      TSAsExpression(node) {
        if (node.parent.type === AST_NODE_TYPES.TSAsExpression) {
          return;
        }

        check(node);
      },
      TSTypeAssertion(node) {
        check(node);
      },
    };
  },
});
