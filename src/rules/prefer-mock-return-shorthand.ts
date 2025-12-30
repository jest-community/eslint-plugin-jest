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
    const isMutable = (identifier: TSESTree.Identifier) => {
      const scope = context.sourceCode.getScope(identifier);

      return scope.through.some(v =>
        v.resolved?.defs.some(
          n => n.type === 'Variable' && n.parent.kind !== 'const',
        ),
      );
    };

    const usesMutableIdentifier = (node: TSESTree.Node): boolean => {
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          return isMutable(node);
        case AST_NODE_TYPES.ObjectExpression:
          return node.properties.some(
            prop =>
              prop.type === AST_NODE_TYPES.Property &&
              usesMutableIdentifier(prop.value),
          );
        case AST_NODE_TYPES.ArrayExpression:
          return node.elements.some(el => el && usesMutableIdentifier(el));
        case AST_NODE_TYPES.BinaryExpression:
          return (
            usesMutableIdentifier(node.left) ||
            usesMutableIdentifier(node.right)
          );
      }

      // currently we assume a mutable identifier is not being used
      // unless we can find one specifically, which is technically
      // not safe but so far it has not seemed to cause issues.
      //
      // if it proves to be too troublesome, we should consider
      // inverting this so we only report when we're completely
      // sure it is safe
      return false;
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

        const { property } = node.callee;

        const mockFnName = getAccessorValue(property);
        const isOnce = mockFnName.endsWith('Once');

        if (mockFnName !== withOnce('mockImplementation', isOnce)) {
          return;
        }

        const [arg] = node.arguments;

        if (!isFunction(arg) || arg.params.length !== 0 || arg.async) {
          return;
        }

        const replacement = withOnce('mockReturnValue', isOnce);

        const returnNode = findSingleReturnArgumentNode(arg);

        if (
          !returnNode ||
          returnNode.type === AST_NODE_TYPES.UpdateExpression
        ) {
          return;
        }

        // check if we're using a non-constant variable
        if (usesMutableIdentifier(returnNode)) {
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
