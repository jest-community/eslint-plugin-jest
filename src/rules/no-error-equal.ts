import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import {
  createRule,
  getAccessorValue,
  isBuiltinSymbolLike,
  parseJestFnCall,
} from './utils';

export type MessageIds = 'equalError';

export type Options = [];

export default createRule<Options, MessageIds>({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow using equality matchers on error types',
      requiresTypeChecking: true,
    },
    messages: {
      equalError: 'Avoid using equality matchers to check errors',
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
          jestFnCall.head.node.parent.type !== AST_NODE_TYPES.CallExpression ||
          !['toEqual', 'toStrictEqual'].includes(
            getAccessorValue(jestFnCall.matcher),
          )
        ) {
          return;
        }

        const [argument] = jestFnCall.head.node.parent.arguments;

        if (
          isBuiltinSymbolLike(
            services.program,
            services.getTypeAtLocation(argument),
            'Error',
          )
        ) {
          context.report({
            messageId: 'equalError',
            node,
          });
        }
      },
    };
  },
});
