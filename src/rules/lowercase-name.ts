import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  JestFunctionCallExpressionWithIdentifierCallee,
  JestFunctionName,
  TestCaseName,
  createRule,
  isDescribe,
  isTestCase,
} from './utils';

type ArgumentLiteral = TSESTree.Literal | TSESTree.TemplateLiteral;

interface FirstArgumentStringCallExpression extends TSESTree.CallExpression {
  arguments: [ArgumentLiteral];
}

type CallExpressionWithCorrectCalleeAndArguments = JestFunctionCallExpressionWithIdentifierCallee<
  TestCaseName.it | TestCaseName.test | DescribeAlias.describe
> &
  FirstArgumentStringCallExpression;

const hasStringAsFirstArgument = (
  node: TSESTree.CallExpression,
): node is FirstArgumentStringCallExpression =>
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
) => {
  const description = testDescription(node.arguments[0]);
  if (description === null) {
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

export default createRule({
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
            items: { enum: ['describe', 'test', 'it'] },
            additionalItems: false,
          },
        },
        additionalProperties: false,
      },
    ],
  } as const,
  defaultOptions: [{ ignore: [] } as { ignore: readonly JestFunctionName[] }],
  create(context, [{ ignore }]) {
    const ignoredFunctionNames = ignore.reduce<
      Record<string, true | undefined>
    >((accumulator, value) => {
      accumulator[value] = true;
      return accumulator;
    }, Object.create(null));

    const isIgnoredFunctionName = (
      node: CallExpressionWithCorrectCalleeAndArguments,
    ) => ignoredFunctionNames[node.callee.name];

    return {
      CallExpression(node) {
        if (!isJestFunctionWithLiteralArg(node)) {
          return;
        }
        const erroneousMethod = jestFunctionName(node);

        if (erroneousMethod && !isIgnoredFunctionName(node)) {
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
