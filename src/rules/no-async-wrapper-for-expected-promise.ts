import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { createRule, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description:
        'Disallow unnecessary async function wrapper for expected promises',
    },
    fixable: 'code',
    messages: {
      noAsyncWrapperForExpectedPromise:
        'Rejected/resolved promises should not be wrapped in async function',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const { parent } = jestFnCall.head.node;

        if (parent?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const [awaitNode] = parent.arguments;

        if (
          (awaitNode?.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
            awaitNode?.type !== AST_NODE_TYPES.FunctionExpression) ||
          !awaitNode?.async ||
          awaitNode.body.type !== AST_NODE_TYPES.BlockStatement ||
          awaitNode.body.body.length !== 1
        ) {
          return;
        }

        const [callback] = awaitNode.body.body;

        if (
          callback.type === AST_NODE_TYPES.ExpressionStatement &&
          callback.expression.type === AST_NODE_TYPES.AwaitExpression &&
          callback.expression.argument.type === AST_NODE_TYPES.CallExpression
        ) {
          const innerAsyncFuncCall = callback.expression.argument;

          context.report({
            node: awaitNode,
            messageId: 'noAsyncWrapperForExpectedPromise',
            fix(fixer) {
              const { sourceCode } = context;

              return [
                fixer.replaceTextRange(
                  [awaitNode.range[0], awaitNode.range[1]],
                  sourceCode.getText(innerAsyncFuncCall),
                ),
              ];
            },
          });
        }
      },
    };
  },
});
