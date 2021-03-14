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
  isDescribeCall,
  isStringNode,
  isTestCaseCall,
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

const compileMatcherPatterns = (
  matchers: Partial<Record<MatcherGroups, string>> | string,
): Record<MatcherGroups, RegExp | null> & Record<string, RegExp | null> => {
  if (typeof matchers === 'string') {
    const matcher = new RegExp(matchers, 'u');

    return {
      describe: matcher,
      test: matcher,
      it: matcher,
    };
  }

  return {
    describe: matchers.describe ? new RegExp(matchers.describe, 'u') : null,
    test: matchers.test ? new RegExp(matchers.test, 'u') : null,
    it: matchers.it ? new RegExp(matchers.it, 'u') : null,
  };
};

type MatcherGroups = 'describe' | 'test' | 'it';

interface Options {
  ignoreTypeOfDescribeName?: boolean;
  disallowedWords?: string[];
  mustNotMatch?: Partial<Record<MatcherGroups, string>> | string;
  mustMatch?: Partial<Record<MatcherGroups, string>> | string;
}

type MessageIds =
  | 'titleMustBeString'
  | 'emptyTitle'
  | 'duplicatePrefix'
  | 'accidentalSpace'
  | 'disallowedWord'
  | 'mustNotMatch'
  | 'mustMatch';

export default createRule<[Options], MessageIds>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce valid titles',
      recommended: 'error',
    },
    messages: {
      titleMustBeString: 'Title must be a string',
      emptyTitle: '{{ jestFunctionName }} should not have an empty title',
      duplicatePrefix: 'should not have duplicate prefix',
      accidentalSpace: 'should not have leading or trailing spaces',
      disallowedWord: '"{{ word }}" is not allowed in test titles.',
      mustNotMatch: '{{ jestFunctionName }} should not match {{ pattern }}',
      mustMatch: '{{ jestFunctionName }} should match {{ pattern }}',
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
          mustNotMatch: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  describe: { type: 'string' },
                  test: { type: 'string' },
                  it: { type: 'string' },
                },
                additionalProperties: false,
              },
            ],
          },
          mustMatch: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  describe: { type: 'string' },
                  test: { type: 'string' },
                  it: { type: 'string' },
                },
                additionalProperties: false,
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },
  defaultOptions: [{ ignoreTypeOfDescribeName: false, disallowedWords: [] }],
  create(
    context,
    [
      {
        ignoreTypeOfDescribeName,
        disallowedWords = [],
        mustNotMatch,
        mustMatch,
      },
    ],
  ) {
    const disallowedWordsRegexp = new RegExp(
      `\\b(${disallowedWords.join('|')})\\b`,
      'iu',
    );

    const mustNotMatchPatterns = compileMatcherPatterns(mustNotMatch ?? {});
    const mustMatchPatterns = compileMatcherPatterns(mustMatch ?? {});

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isDescribeCall(node) && !isTestCaseCall(node)) {
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
            !(ignoreTypeOfDescribeName && isDescribeCall(node))
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
              jestFunctionName: isDescribeCall(node)
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

        const [jestFunctionName] = nodeName.split('.');

        const mustNotMatchPattern = mustNotMatchPatterns[jestFunctionName];

        if (mustNotMatchPattern) {
          if (mustNotMatchPattern.test(title)) {
            context.report({
              messageId: 'mustNotMatch',
              node: argument,
              data: { jestFunctionName, pattern: mustNotMatchPattern },
            });

            return;
          }
        }

        const mustMatchPattern = mustMatchPatterns[jestFunctionName];

        if (mustMatchPattern) {
          if (!mustMatchPattern.test(title)) {
            context.report({
              messageId: 'mustMatch',
              node: argument,
              data: { jestFunctionName, pattern: mustMatchPattern },
            });

            return;
          }
        }
      },
    };
  },
});
