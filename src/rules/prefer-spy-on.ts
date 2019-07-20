import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, getNodeName } from './tsUtils';

const findNodeObject = (
  node: TSESTree.CallExpression | TSESTree.MemberExpression,
): TSESTree.LeftHandSideExpression | null => {
  if ('object' in node) {
    return node.object;
  }

  if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
    return node.callee.object;
  }

  return null;
};

const getJestFnCall = (node: TSESTree.Node): TSESTree.CallExpression | null => {
  if (
    node.type !== AST_NODE_TYPES.CallExpression &&
    node.type !== AST_NODE_TYPES.MemberExpression
  ) {
    return null;
  }

  const obj = findNodeObject(node);

  if (!obj) {
    return null;
  }

  if (obj.type === AST_NODE_TYPES.Identifier) {
    return node.type === AST_NODE_TYPES.CallExpression &&
      getNodeName(node.callee) === 'jest.fn'
      ? node
      : null;
  }

  return getJestFnCall(obj);
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `jest.spyOn()`',
      recommended: false,
    },
    messages: {
      useJestSpyOn: 'Use jest.spyOn() instead.',
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      AssignmentExpression(node) {
        const { left, right } = node;

        if (left.type !== AST_NODE_TYPES.MemberExpression) return;

        const jestFnCall = getJestFnCall(right);

        if (!jestFnCall) return;

        context.report({
          node,
          messageId: 'useJestSpyOn',
          fix(fixer) {
            const leftPropQuote =
              left.property.type === AST_NODE_TYPES.Identifier ? "'" : '';
            const [arg] = jestFnCall.arguments;
            const argSource = arg && context.getSourceCode().getText(arg);
            const mockImplementation = argSource
              ? `.mockImplementation(${argSource})`
              : '';

            return [
              fixer.insertTextBefore(left, `jest.spyOn(`),
              fixer.replaceTextRange(
                [left.object.range[1], left.property.range[0]],
                `, ${leftPropQuote}`,
              ),
              fixer.replaceTextRange(
                [left.property.range[1], jestFnCall.range[1]],
                `${leftPropQuote})${mockImplementation}`,
              ),
            ];
          },
        });
      },
    };
  },
});
