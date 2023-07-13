import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  type AccessorNode,
  type FunctionExpression,
  createRule,
  getAccessorValue,
  getNodeName,
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
      description: 'Prefer mock resolved/rejected shorthands for promises',
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
    const report = (
      property: AccessorNode,
      isOnce: boolean,
      outerArgNode: TSESTree.Node,
      innerArgNode: TSESTree.Node | null = outerArgNode,
    ) => {
      if (innerArgNode?.type !== AST_NODE_TYPES.CallExpression) {
        return;
      }

      const argName = getNodeName(innerArgNode);

      if (argName !== 'Promise.resolve' && argName !== 'Promise.reject') {
        return;
      }

      const replacement = withOnce(
        argName.endsWith('reject') ? 'mockRejectedValue' : 'mockResolvedValue',
        isOnce,
      );

      context.report({
        node: property,
        messageId: 'useMockShorthand',
        data: { replacement },
        fix(fixer) {
          const sourceCode = context.getSourceCode();

          // there shouldn't be more than one argument, but if there is don't try
          // fixing since we have no idea what to do with the extra arguments
          if (innerArgNode.arguments.length > 1) {
            return null;
          }

          return [
            fixer.replaceText(property, replacement),
            fixer.replaceText(
              outerArgNode,
              // the value argument for both Promise methods is optional,
              // whereas for Jest they're required so use an explicit undefined
              // if no argument is being passed to the call we're replacing
              innerArgNode.arguments.length === 1
                ? sourceCode.getText(innerArgNode.arguments[0])
                : 'undefined',
            ),
          ];
        },
      });
    };

    return {
      CallExpression(node) {
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          !isSupportedAccessor(node.callee.property) ||
          node.arguments.length === 0
        ) {
          return;
        }

        const mockFnName = getAccessorValue(node.callee.property);
        const isOnce = mockFnName.endsWith('Once');

        if (mockFnName === withOnce('mockReturnValue', isOnce)) {
          report(node.callee.property, isOnce, node.arguments[0]);
        } else if (mockFnName === withOnce('mockImplementation', isOnce)) {
          const [arg] = node.arguments;

          if (!isFunction(arg) || arg.params.length !== 0) {
            return;
          }

          report(
            node.callee.property,
            isOnce,
            arg,
            findSingleReturnArgumentNode(arg),
          );
        }
      },
    };
  },
});
