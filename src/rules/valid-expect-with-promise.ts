import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import {
  createRule,
  getAccessorValue,
  isBuiltinSymbolLike,
  parseJestFnCall,
} from './utils';

export type MessageIds = 'poorlyExpectedPromise' | 'unneededRejectResolve';

export type Options = [];

export default createRule<Options, MessageIds>({
  name: __filename,
  meta: {
    docs: {
      description:
        'Require that `resolve` and `reject` modifiers are present (and only) for promise-like types',
      requiresTypeChecking: true,
    },
    messages: {
      poorlyExpectedPromise:
        'Subject is a promise so resolve or reject should be used',
      unneededRejectResolve:
        'Subject is not a promise so {{ modifier }} is not needed',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (
          jestFnCall?.type !== 'expect' ||
          jestFnCall.head.node.parent.type !== AST_NODE_TYPES.CallExpression
        ) {
          return;
        }

        const [argument] = jestFnCall.head.node.parent.arguments;

        const isPromiseLike = isBuiltinSymbolLike(
          services.program,
          services.getTypeAtLocation(argument),
          'Promise',
        );

        const promiseModifier = jestFnCall.modifiers.find(
          nod => getAccessorValue(nod) !== 'not',
        );

        if (isPromiseLike && !promiseModifier) {
          context.report({
            messageId: 'poorlyExpectedPromise',
            node,
          });

          return;
        }

        if (!isPromiseLike && promiseModifier) {
          context.report({
            messageId: 'unneededRejectResolve',
            data: { modifier: getAccessorValue(promiseModifier) },
            node: promiseModifier,
          });
        }
      },
    };
  },
});
