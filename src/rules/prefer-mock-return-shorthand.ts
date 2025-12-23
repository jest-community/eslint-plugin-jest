import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  type FunctionExpression,
  createRule,
  getAccessorValue,
  isFunction,
  isSupportedAccessor,
} from './utils';

const withOnce = (name: string, addOnce: boolean): string => {
  return `${name}${addOnce ? 'Once' : ''}`;
};

const findSingleReturnArgumentNode = (
  fnNode: FunctionExpression,
): TSESTree.Expression | null => {
  if (fnNode.body.type !== AST_NODE_TYPES.BlockStatement) {
    return fnNode.body;
  }

  if (fnNode.body.body[0]?.type === AST_NODE_TYPES.ReturnStatement) {
    return fnNode.body.body[0].argument;
  }

  return null;
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Prefer mock return shorthands',
    },
    messages: {
      useMockShorthand: 'Prefer {{ replacement }}',
    },
    schema: [],
    type: 'suggestion',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          !isSupportedAccessor(node.callee.property) ||
          node.arguments.length === 0
        ) {
          return;
        }

        const { property } = node.callee;

        const mockFnName = getAccessorValue(property);
        const isOnce = mockFnName.endsWith('Once');

        if (mockFnName !== withOnce('mockImplementation', isOnce)) {
          return;
        }

        const [arg] = node.arguments;

        if (!isFunction(arg) || arg.params.length !== 0) {
          return;
        }

        const replacement = withOnce('mockReturnValue', isOnce);

        const returnNode = findSingleReturnArgumentNode(arg);

        if (!returnNode) {
          return;
        }

        context.report({
          node: property,
          messageId: 'useMockShorthand',
          data: { replacement },
          fix(fixer) {
            return [
              fixer.replaceText(property, replacement),
              fixer.replaceText(arg, context.sourceCode.getText(returnNode)),
            ];
          },
        });
      },
    };
  },
});
