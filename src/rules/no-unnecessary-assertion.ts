import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import ts from 'typescript';
import { createRule, isSupportedAccessor, parseJestFnCall } from './utils';

const canBeNull = (firstArgumentType: ts.Type) => {
  if (firstArgumentType.isUnion()) {
    return firstArgumentType.types.some(typ => typ.flags & ts.TypeFlags.Null);
  }

  return firstArgumentType.flags & ts.TypeFlags.Null;
};

export type MessageIds = 'unnecessaryAssertion';

export type Options = [];

export default createRule<Options, MessageIds>({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow unnecessary assertions based on types',
    },
    messages: {
      unnecessaryAssertion: 'Unnecessary assertion, subject cannot be null',
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
          !isSupportedAccessor(jestFnCall.matcher, 'toBeNull')
        ) {
          return;
        }

        const { parent: expect } = jestFnCall.head.node;

        if (expect?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const [argument] = expect.arguments;

        const isNullable = canBeNull(services.getTypeAtLocation(argument));

        if (!isNullable) {
          context.report({
            messageId: 'unnecessaryAssertion',
            node,
          });
        }
      },
    };
  },
});
