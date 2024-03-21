import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  type CallExpressionWithSingleArgument,
  DescribeAlias,
  type StringNode,
  TestCaseName,
  createRule,
  getStringValue,
  isStringNode,
  isTypeOfJestFnCall,
  parseJestFnCall,
} from './utils';

type IgnorableFunctionExpressions =
  | TestCaseName.it
  | TestCaseName.test
  | DescribeAlias.describe;

const hasStringAsFirstArgument = (
  node: TSESTree.CallExpression,
): node is CallExpressionWithSingleArgument<StringNode> =>
  node.arguments[0] && isStringNode(node.arguments[0]);

const populateIgnores = (ignore: readonly string[]): string[] => {
  const ignores: string[] = [];

  if (ignore.includes(DescribeAlias.describe)) {
    ignores.push(...Object.keys(DescribeAlias));
  }
  if (ignore.includes(TestCaseName.test)) {
    ignores.push(
      ...Object.keys(TestCaseName).filter(k => k.endsWith(TestCaseName.test)),
    );
  }
  if (ignore.includes(TestCaseName.it)) {
    ignores.push(
      ...Object.keys(TestCaseName).filter(k => k.endsWith(TestCaseName.it)),
    );
  }

  return ignores;
};

export default createRule<
  [
    Partial<{
      ignore: readonly IgnorableFunctionExpressions[];
      allowedPrefixes: readonly string[];
      ignoreTopLevelDescribe: boolean;
    }>,
  ],
  'unexpectedLowercase'
>({
  name: __filename,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce lowercase test names',
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
              type: 'string',
              // for some reason TypeScript thinks this _must_ be a read-only
              // array, so we have to explicitly cast it as a mutable array
              enum: [
                DescribeAlias.describe,
                TestCaseName.test,
                TestCaseName.it,
              ] as string[],
            },
            additionalItems: false,
          },
          allowedPrefixes: {
            type: 'array',
            items: { type: 'string' },
            additionalItems: false,
          },
          ignoreTopLevelDescribe: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  } as const,
  defaultOptions: [
    { ignore: [], allowedPrefixes: [], ignoreTopLevelDescribe: false },
  ],
  create(
    context,
    [{ ignore = [], allowedPrefixes = [], ignoreTopLevelDescribe }],
  ) {
    const ignores = populateIgnores(ignore);
    let numberOfDescribeBlocks = 0;

    return {
      CallExpression(node: TSESTree.CallExpression) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall || !hasStringAsFirstArgument(node)) {
          return;
        }

        if (jestFnCall.type === 'describe') {
          numberOfDescribeBlocks++;

          if (ignoreTopLevelDescribe && numberOfDescribeBlocks === 1) {
            return;
          }
        } else if (jestFnCall.type !== 'test') {
          return;
        }

        const [firstArg] = node.arguments;

        const description = getStringValue(firstArg);

        if (allowedPrefixes.some(name => description.startsWith(name))) {
          return;
        }

        const firstCharacter = description.charAt(0);

        if (
          !firstCharacter ||
          firstCharacter === firstCharacter.toLowerCase() ||
          ignores.includes(jestFnCall.name as IgnorableFunctionExpressions)
        ) {
          return;
        }

        context.report({
          messageId: 'unexpectedLowercase',
          node: node.arguments[0],
          data: { method: jestFnCall.name },
          fix(fixer) {
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
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (isTypeOfJestFnCall(node, context, ['describe'])) {
          numberOfDescribeBlocks--;
        }
      },
    };
  },
});
