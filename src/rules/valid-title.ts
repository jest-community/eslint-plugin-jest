import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  StringNode,
  TestCaseName,
  createRule,
  getJestFunctionArguments,
  getNodeName,
  getStringValue,
  isDescribe,
  isStringNode,
  isTestCase,
} from './utils';

const trimFXprefix = (word: string) =>
  ['f', 'x'].includes(word.charAt(0)) ? word.substr(1) : word;

const doesBinaryExpressionContainStringNode = (
  binaryExp: TSESTree.BinaryExpression,
): boolean => {
  if (isStringNode(binaryExp.right)) {
    return true;
  }

  if (binaryExp.left.type === AST_NODE_TYPES.BinaryExpression) {
    return doesBinaryExpressionContainStringNode(binaryExp.left);
  }

  return isStringNode(binaryExp.left);
};

const quoteStringValue = (node: StringNode): string =>
  node.type === AST_NODE_TYPES.TemplateLiteral
    ? `\`${node.quasis[0].value.raw}\``
    : node.raw;

type MessageIds =
  | 'titleMustBeString'
  | 'emptyTitle'
  | 'duplicatePrefix'
  | 'accidentalSpace'
  | 'disallowedWord';

export default createRule<
  [{ ignoreTypeOfDescribeName?: boolean; disallowedWords?: string[] }],
  MessageIds
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce valid titles',
      recommended: false,
    },
    messages: {
      titleMustBeString: 'Title must be a string',
      emptyTitle: '{{ jestFunctionName }} should not have an empty title',
      duplicatePrefix: 'should not have duplicate prefix',
      accidentalSpace: 'should not have leading or trailing spaces',
      disallowedWord: '"{{ word }}" is not allowed in test titles.',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreTypeOfDescribeName: {
            type: 'boolean',
            default: false,
          },
          disallowedWords: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },
  defaultOptions: [{ ignoreTypeOfDescribeName: false, disallowedWords: [] }],
  create(context, [{ ignoreTypeOfDescribeName, disallowedWords = [] }]) {
    const disallowedWordsRegexp = new RegExp(
      `\\b(${disallowedWords.join('|')})\\b`,
      'iu',
    );

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isDescribe(node) && !isTestCase(node)) {
          return;
        }

        const [argument] = getJestFunctionArguments(node);

        if (!argument) {
          return;
        }

        if (!isStringNode(argument)) {
          if (
            argument.type === AST_NODE_TYPES.BinaryExpression &&
            doesBinaryExpressionContainStringNode(argument)
          ) {
            return;
          }

          if (
            argument.type !== AST_NODE_TYPES.TemplateLiteral &&
            !(ignoreTypeOfDescribeName && isDescribe(node))
          ) {
            context.report({
              messageId: 'titleMustBeString',
              loc: argument.loc,
            });
          }

          return;
        }

        const title = getStringValue(argument);

        if (!title) {
          context.report({
            messageId: 'emptyTitle',
            data: {
              jestFunctionName: isDescribe(node)
                ? DescribeAlias.describe
                : TestCaseName.test,
            },
            node,
          });

          return;
        }

        if (disallowedWords.length > 0) {
          const disallowedMatch = disallowedWordsRegexp.exec(title);

          if (disallowedMatch) {
            context.report({
              data: { word: disallowedMatch[1] },
              messageId: 'disallowedWord',
              node: argument,
            });

            return;
          }
        }

        if (title.trim().length !== title.length) {
          context.report({
            messageId: 'accidentalSpace',
            node: argument,
            fix: fixer => [
              fixer.replaceTextRange(
                argument.range,
                quoteStringValue(argument)
                  .replace(/^([`'"]) +?/u, '$1')
                  .replace(/ +?([`'"])$/u, '$1'),
              ),
            ],
          });
        }

        const nodeName = trimFXprefix(getNodeName(node.callee));
        const [firstWord] = title.split(' ');

        if (firstWord.toLowerCase() === nodeName) {
          context.report({
            messageId: 'duplicatePrefix',
            node: argument,
            fix: fixer => [
              fixer.replaceTextRange(
                argument.range,
                quoteStringValue(argument).replace(/^([`'"]).+? /u, '$1'),
              ),
            ],
          });
        }
      },
    };
  },
});
