import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  CallExpressionWithSingleArgument,
  DescribeAlias,
  StringNode,
  TestCaseName,
  createRule,
  getStringValue,
  isDescribeCall,
  isEachCall,
  isStringNode,
  isTestCaseCall,
} from './utils';

type IgnorableFunctionExpressions =
  | TestCaseName.it
  | TestCaseName.test
  | DescribeAlias.describe;

const hasStringAsFirstArgument = (
  node: TSESTree.CallExpression,
): node is CallExpressionWithSingleArgument<StringNode> =>
  node.arguments[0] && isStringNode(node.arguments[0]);

const findNodeNameAndArgument = (
  node: TSESTree.CallExpression,
): [name: string, firstArg: StringNode] | null => {
  if (!(isTestCaseCall(node) || isDescribeCall(node))) {
    return null;
  }

  if (isEachCall(node)) {
    if (
      node.parent.arguments.length > 0 &&
      isStringNode(node.parent.arguments[0])
    ) {
      return [node.callee.object.name, node.parent.arguments[0]];
    }

    return null;
  }

  if (
    node.callee.type !== AST_NODE_TYPES.Identifier ||
    !hasStringAsFirstArgument(node)
  ) {
    return null;
  }

  return [node.callee.name, node.arguments[0]];
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
    let numberOfDescribeBlocks = 0;

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (isDescribeCall(node)) {
          numberOfDescribeBlocks++;

          if (ignoreTopLevelDescribe && numberOfDescribeBlocks === 1) {
            return;
          }
        }

        const results = findNodeNameAndArgument(node);

        if (!results) {
          return;
        }

        const [name, firstArg] = results;

        const description = getStringValue(firstArg);

        if (allowedPrefixes.some(name => description.startsWith(name))) {
          return;
        }

        const firstCharacter = description.charAt(0);

        if (
          !firstCharacter ||
          firstCharacter === firstCharacter.toLowerCase() ||
          ignore.includes(name as IgnorableFunctionExpressions)
        ) {
          return;
        }

        context.report({
          messageId: 'unexpectedLowercase',
          node: node.arguments[0],
          data: { method: name },
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
        if (isDescribeCall(node)) {
          numberOfDescribeBlocks--;
        }
      },
    };
  },
});
