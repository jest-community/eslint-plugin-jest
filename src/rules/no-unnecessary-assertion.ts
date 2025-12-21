import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import type ts from 'typescript';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

const canBe = (firstArgumentType: ts.Type, flag: ts.TypeFlags) => {
  if (firstArgumentType.isUnion()) {
    return firstArgumentType.types.some(typ => typ.flags & flag);
  }

  return firstArgumentType.flags & flag;
};

export type MessageIds = 'unnecessaryAssertion' | 'noStrictNullCheck';

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
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);

    const compilerOptions = services.program.getCompilerOptions();

    const isStrictNullChecks =
      compilerOptions.strictNullChecks ||
      (compilerOptions.strict && compilerOptions.strictNullChecks !== false);

    if (!isStrictNullChecks) {
      context.report({
        loc: {
          start: { column: 0, line: 0 },
          end: { column: 0, line: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TypeFlags } = require('typescript') as typeof ts;

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
          !['toBeNull', 'toBeDefined', 'toBeUndefined', 'toBeNaN'].includes(
            matcherName,
          )
        ) {
          return;
        }

        // todo: we should support resolving promise types
        if (jestFnCall.modifiers.some(nod => getAccessorValue(nod) !== 'not')) {
          return;
        }

        const [argument] = jestFnCall.head.node.parent.arguments;

        const isTypePossible = canBe(
          services.getTypeAtLocation(argument),
          matcherName === 'toBeNaN'
            ? TypeFlags.NumberLike
            : matcherName === 'toBeNull'
              ? TypeFlags.Null
              : TypeFlags.Undefined,
        );

        if (!isTypePossible) {
          context.report({
            messageId: 'unnecessaryAssertion',
            data: {
              thing:
                matcherName === 'toBeNaN'
                  ? 'a number'
                  : matcherName === 'toBeNull'
                    ? 'null'
                    : 'undefined',
            },
            node,
          });
        }
      },
    };
  },
});
