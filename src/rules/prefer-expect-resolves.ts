import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { createRule, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description:
        'Prefer `await expect(...).resolves` over `expect(await ...)` syntax',
    },
    fixable: 'code',
    messages: {
      expectResolves: 'Use `await expect(...).resolves instead',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node: TSESTree.CallExpression) {
      const jestFnCall = parseJestFnCall(node, context);

      if (jestFnCall?.type !== 'expect') {
        return;
      }

      const { parent } = jestFnCall.head.node;

      if (parent.type !== AST_NODE_TYPES.CallExpression) {
        return;
      }

      const [awaitNode] = parent.arguments;

      if (awaitNode?.type === AST_NODE_TYPES.AwaitExpression) {
        context.report({
          node: awaitNode,
          messageId: 'expectResolves',
          fix(fixer) {
            const argumentText = context.sourceCode.getText(awaitNode.argument);

            return [
              fixer.insertTextBefore(parent, 'await '),
              fixer.replaceText(
                awaitNode,
                awaitNode.argument.type === AST_NODE_TYPES.SequenceExpression
                  ? `(${argumentText})`
                  : argumentText,
              ),
              fixer.insertTextAfter(parent, '.resolves'),
            ];
          },
        });
      }
    },
  }),
});
