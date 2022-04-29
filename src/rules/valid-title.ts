import { AST_NODE_TYPES, JSONSchema, TSESTree } from '@typescript-eslint/utils';
import {
  DescribeAlias,
  StringNode,
  TestCaseName,
  createRule,
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

const compileMatcherPattern = (
  matcherMaybeWithMessage: MatcherAndMessage | string,
): CompiledMatcherAndMessage => {
  const [matcher, message] = Array.isArray(matcherMaybeWithMessage)
    ? matcherMaybeWithMessage
    : [matcherMaybeWithMessage];

  return [new RegExp(matcher, 'u'), message];
};

const compileMatcherPatterns = (
  matchers:
    | Partial<Record<MatcherGroups, string | MatcherAndMessage>>
    | MatcherAndMessage
    | string,
): Record<MatcherGroups, CompiledMatcherAndMessage | null> &
  Record<string, CompiledMatcherAndMessage | null> => {
  if (typeof matchers === 'string' || Array.isArray(matchers)) {
    const compiledMatcher = compileMatcherPattern(matchers);

    return {
      describe: compiledMatcher,
      test: compiledMatcher,
      it: compiledMatcher,
    };
  }

  return {
    describe: matchers.describe
      ? compileMatcherPattern(matchers.describe)
      : null,
    test: matchers.test ? compileMatcherPattern(matchers.test) : null,
    it: matchers.it ? compileMatcherPattern(matchers.it) : null,
  };
};

type CompiledMatcherAndMessage = [matcher: RegExp, message?: string];
type MatcherAndMessage = [matcher: string, message?: string];

const MatcherAndMessageSchema: JSONSchema.JSONSchema7 = {
  type: 'array',
  items: { type: 'string' },
  minItems: 1,
  maxItems: 2,
  additionalItems: false,
} as const;

type MatcherGroups = 'describe' | 'test' | 'it';

interface Options {
  ignoreTypeOfDescribeName?: boolean;
  disallowedWords?: string[];
  mustNotMatch?:
    | Partial<Record<MatcherGroups, string | MatcherAndMessage>>
    | MatcherAndMessage
    | string;
  mustMatch?:
    | Partial<Record<MatcherGroups, string | MatcherAndMessage>>
    | MatcherAndMessage
    | string;
}

type MessageIds =
  | 'titleMustBeString'
  | 'emptyTitle'
  | 'duplicatePrefix'
  | 'accidentalSpace'
  | 'disallowedWord'
  | 'mustNotMatch'
  | 'mustMatch'
  | 'mustNotMatchCustom'
  | 'mustMatchCustom';

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
      mustNotMatchCustom: '{{ message }}',
      mustMatchCustom: '{{ message }}',
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
        patternProperties: {
          [/^must(?:Not)?Match$/u.source]: {
            oneOf: [
              { type: 'string' },
              MatcherAndMessageSchema,
              {
                type: 'object',
                propertyNames: { enum: ['describe', 'test', 'it'] },
                additionalProperties: {
                  oneOf: [{ type: 'string' }, MatcherAndMessageSchema],
                },
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
    const scope = context.getScope();
    const disallowedWordsRegexp = new RegExp(
      `\\b(${disallowedWords.join('|')})\\b`,
      'iu',
    );

    const mustNotMatchPatterns = compileMatcherPatterns(mustNotMatch ?? {});
    const mustMatchPatterns = compileMatcherPatterns(mustMatch ?? {});

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isDescribeCall(node, scope) && !isTestCaseCall(node, scope)) {
          return;
        }

        const [argument] = node.arguments;

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
            !(ignoreTypeOfDescribeName && isDescribeCall(node, scope))
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
              jestFunctionName: isDescribeCall(node, scope)
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

        const nodeName = trimFXprefix(getNodeName(node));
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

        const [mustNotMatchPattern, mustNotMatchMessage] =
          mustNotMatchPatterns[jestFunctionName] ?? [];

        if (mustNotMatchPattern) {
          if (mustNotMatchPattern.test(title)) {
            context.report({
              messageId: mustNotMatchMessage
                ? 'mustNotMatchCustom'
                : 'mustNotMatch',
              node: argument,
              data: {
                jestFunctionName,
                pattern: mustNotMatchPattern,
                message: mustNotMatchMessage,
              },
            });

            return;
          }
        }

        const [mustMatchPattern, mustMatchMessage] =
          mustMatchPatterns[jestFunctionName] ?? [];

        if (mustMatchPattern) {
          if (!mustMatchPattern.test(title)) {
            context.report({
              messageId: mustMatchMessage ? 'mustMatchCustom' : 'mustMatch',
              node: argument,
              data: {
                jestFunctionName,
                pattern: mustMatchPattern,
                message: mustMatchMessage,
              },
            });

            return;
          }
        }
      },
    };
  },
});
