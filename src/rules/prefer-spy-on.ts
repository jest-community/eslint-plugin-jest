import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { createRule, getNodeName } from './utils';

const findNodeObject = (
  node: TSESTree.CallExpression | TSESTree.MemberExpression,
): TSESTree.Expression | null => {
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

const getAutoFixMockImplementation = (
  jestFnCall: TSESTree.CallExpression,
  context: TSESLint.RuleContext<'useJestSpyOn', unknown[]>,
): string => {
  const hasMockImplementationAlready =
    jestFnCall.parent?.type === AST_NODE_TYPES.MemberExpression &&
    jestFnCall.parent.property.type === AST_NODE_TYPES.Identifier &&
    jestFnCall.parent.property.name === 'mockImplementation';

  if (hasMockImplementationAlready) {
    return '';
  }

  const [arg] = jestFnCall.arguments;
  const argSource = arg && context.getSourceCode().getText(arg);

  return argSource
    ? `.mockImplementation(${argSource})`
    : '.mockImplementation()';
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

        if (left.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const jestFnCall = getJestFnCall(right);

        if (!jestFnCall) {
          return;
        }

        context.report({
          node,
          messageId: 'useJestSpyOn',
          fix(fixer) {
            const leftPropQuote =
              left.property.type === AST_NODE_TYPES.Identifier && !left.computed
                ? "'"
                : '';
            const mockImplementation = getAutoFixMockImplementation(
              jestFnCall,
              context,
            );

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
