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
          return node.properties.some(prop => usesMutableIdentifier(prop));
        case AST_NODE_TYPES.Property:
          if (node.computed && usesMutableIdentifier(node.key)) {
            return true;
          }

          return usesMutableIdentifier(node.value);
        case AST_NODE_TYPES.ArrayExpression:
          return node.elements.some(el => el && usesMutableIdentifier(el));
        case AST_NODE_TYPES.ChainExpression:
          return usesMutableIdentifier(node.expression);
        case AST_NODE_TYPES.SpreadElement:
        case AST_NODE_TYPES.UnaryExpression:
          return usesMutableIdentifier(node.argument);
        case AST_NODE_TYPES.LogicalExpression:
        case AST_NODE_TYPES.BinaryExpression:
          return (
            usesMutableIdentifier(node.left) ||
            usesMutableIdentifier(node.right)
          );
        case AST_NODE_TYPES.MemberExpression:
          if (node.computed && usesMutableIdentifier(node.property)) {
            return true;
          }

          return (
            node.object.type === AST_NODE_TYPES.CallExpression &&
            usesMutableIdentifier(node.object)
          );
        case AST_NODE_TYPES.ConditionalExpression:
          return (
            usesMutableIdentifier(node.test) ||
            usesMutableIdentifier(node.alternate) ||
            usesMutableIdentifier(node.consequent)
          );
        case AST_NODE_TYPES.NewExpression:
        case AST_NODE_TYPES.CallExpression:
          return (
            usesMutableIdentifier(node.callee) ||
            node.arguments.some(arg => usesMutableIdentifier(arg))
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
