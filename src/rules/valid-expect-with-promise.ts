import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import {
  createRule,
  getAccessorValue,
  isBuiltinSymbolLike,
  isThenableType,
  parseJestFnCall,
} from './utils';

export type MessageIds = 'poorlyExpectedPromise' | 'unneededRejectResolve';

export type Options = [
  {
    checkThenables?: boolean;
  },
];

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
    schema: [
      {
        type: 'object',
        properties: {
          checkThenables: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ checkThenables: false }],
  create(context, [{ checkThenables }]) {
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

        const argumentType = services.getTypeAtLocation(argument);

        // `isBuiltinSymbolLike` only recognises the `Promise` declared in
        // TypeScript's default libraries, so optionally check for any thenable
        // (e.g. custom promise types in `noLib` environments, or polyfills)
        const isPromiseLike =
          isBuiltinSymbolLike(services.program, argumentType, 'Promise') ||
          (checkThenables === true &&
            isThenableType(
              services.program,
              services.esTreeNodeToTSNodeMap.get(argument),
              argumentType,
            ));

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
