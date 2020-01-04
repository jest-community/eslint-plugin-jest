import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  CallExpressionWithSingleArgument,
  DescribeAlias,
  JestFunctionCallExpressionWithIdentifierCallee,
  TestCaseName,
  createRule,
  isDescribe,
  isTestCase,
} from './utils';

type ArgumentLiteral = TSESTree.Literal | TSESTree.TemplateLiteral;

type IgnorableFunctionExpressions =
  | TestCaseName.it
  | TestCaseName.test
  | DescribeAlias.describe;

type CallExpressionWithCorrectCalleeAndArguments = JestFunctionCallExpressionWithIdentifierCallee<
  IgnorableFunctionExpressions
> &
  CallExpressionWithSingleArgument<ArgumentLiteral>;

const hasStringAsFirstArgument = (
  node: TSESTree.CallExpression,
): node is CallExpressionWithSingleArgument<ArgumentLiteral> =>
  node.arguments &&
  node.arguments[0] &&
  (node.arguments[0].type === AST_NODE_TYPES.Literal ||
    node.arguments[0].type === AST_NODE_TYPES.TemplateLiteral);

const isJestFunctionWithLiteralArg = (
  node: TSESTree.CallExpression,
): node is CallExpressionWithCorrectCalleeAndArguments =>
  (isTestCase(node) || isDescribe(node)) &&
  node.callee.type === AST_NODE_TYPES.Identifier &&
  hasStringAsFirstArgument(node);

const testDescription = (argument: ArgumentLiteral): string | null => {
  if (argument.type === AST_NODE_TYPES.Literal) {
    const { value } = argument;

    if (typeof value === 'string') {
      return value;
    }
    return null;
  }

  return argument.quasis[0].value.raw;
};

const jestFunctionName = (
  node: CallExpressionWithCorrectCalleeAndArguments,
  allowedPrefixes: readonly string[],
) => {
  const description = testDescription(node.arguments[0]);
  if (
    description === null ||
    allowedPrefixes.some(name => description.startsWith(name))
  ) {
    return null;
  }

  const firstCharacter = description.charAt(0);

  if (!firstCharacter) {
    return null;
  }

  if (firstCharacter !== firstCharacter.toLowerCase()) {
    return node.callee.name;
  }

  return null;
};

export default createRule<
  [
    Partial<{
      ignore: readonly IgnorableFunctionExpressions[];
      allowedPrefixes: readonly string[];
    }>,
  ],
  'unexpectedLowercase'
>({
  name: __filename,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce `it`, `test` and `describe` to have descriptions that begin with a lowercase letter. This provides more readable test failures.',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      unexpectedLowercase: '`{{ method }}`s should begin with lowercase',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {
              enum: [
                DescribeAlias.describe,
                TestCaseName.test,
                TestCaseName.it,
              ],
            },
            additionalItems: false,
          },
          allowedPrefixes: {
            type: 'array',
            items: { type: 'string' },
            additionalItems: false,
          },
        },
        additionalProperties: false,
      },
    ],
  } as const,
  defaultOptions: [{ ignore: [], allowedPrefixes: [] }],
  create(context, [{ ignore = [], allowedPrefixes = [] }]) {
    return {
      CallExpression(node) {
        if (!isJestFunctionWithLiteralArg(node)) {
          return;
        }
        const erroneousMethod = jestFunctionName(node, allowedPrefixes);

        if (erroneousMethod && !ignore.includes(node.callee.name)) {
          context.report({
            messageId: 'unexpectedLowercase',
            data: { method: erroneousMethod },
            node,
            fix(fixer) {
              const [firstArg] = node.arguments;
              // guaranteed by jestFunctionName
              const description = testDescription(firstArg)!;

              const rangeIgnoringQuotes: TSESLint.AST.Range = [
                firstArg.range[0] + 1,
                firstArg.range[1] - 1,
              ];
              const newDescription =
                description.substring(0, 1).toLowerCase() +
                description.substring(1);

              return [
                fixer.replaceTextRange(rangeIgnoringQuotes, newDescription),
              ];
            },
          });
        }
      },
    };
  },
});
