import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import ts from 'typescript';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

const canBe = (firstArgumentType: ts.Type, flag: ts.TypeFlags) => {
  if (firstArgumentType.isUnion()) {
    return firstArgumentType.types.some(typ => typ.flags & flag);
  }

  return firstArgumentType.flags & flag;
};

export type MessageIds = 'unnecessaryAssertion';

export type Options = [];

export default createRule<Options, MessageIds>({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow unnecessary assertions based on types',
      requiresTypeChecking: true,
    },
    messages: {
      unnecessaryAssertion:
        'Unnecessary assertion, subject cannot be {{ thing }}',
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

        const matcherName = getAccessorValue(jestFnCall.matcher);

        if (
          !['toBeNull', 'toBeDefined', 'toBeUndefined'].includes(matcherName)
        ) {
          return;
        }

        const [argument] = jestFnCall.head.node.parent.arguments;

        const isNullable = canBe(
          services.getTypeAtLocation(argument),
          matcherName === 'toBeNull'
            ? ts.TypeFlags.Null
            : ts.TypeFlags.Undefined,
        );

        if (!isNullable) {
          context.report({
            messageId: 'unnecessaryAssertion',
            data: { thing: matcherName === 'toBeNull' ? 'null' : 'undefined' },
            node,
          });
        }
      },
    };
  },
});
