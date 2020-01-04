import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  CallExpressionWithSingleArgument,
  DescribeAlias,
  JestFunctionCallExpressionWithIdentifierCallee,
  StringNode,
  TestCaseName,
  createRule,
  getStringValue,
  isDescribe,
  isStringNode,
  isTestCase,
} from './utils';

type IgnorableFunctionExpressions =
  | TestCaseName.it
  | TestCaseName.test
  | DescribeAlias.describe;

type CallExpressionWithCorrectCalleeAndArguments = JestFunctionCallExpressionWithIdentifierCallee<
  IgnorableFunctionExpressions
> &
  CallExpressionWithSingleArgument<StringNode>;

const hasStringAsFirstArgument = (
  node: TSESTree.CallExpression,
): node is CallExpressionWithSingleArgument<StringNode> =>
  node.arguments[0] && isStringNode(node.arguments[0]);

const isJestFunctionWithLiteralArg = (
  node: TSESTree.CallExpression,
): node is CallExpressionWithCorrectCalleeAndArguments =>
  (isTestCase(node) || isDescribe(node)) &&
  node.callee.type === AST_NODE_TYPES.Identifier &&
  hasStringAsFirstArgument(node);

const jestFunctionName = (
  node: CallExpressionWithCorrectCalleeAndArguments,
  allowedPrefixes: readonly string[],
) => {
  const description = getStringValue(node.arguments[0]);
  if (allowedPrefixes.some(name => description.startsWith(name))) {
    return null;
  }

  const firstCharacter = description.charAt(0);

  if (!firstCharacter || firstCharacter === firstCharacter.toLowerCase()) {
    return null;
  }

  return node.callee.name;
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

              const description = getStringValue(firstArg);

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
