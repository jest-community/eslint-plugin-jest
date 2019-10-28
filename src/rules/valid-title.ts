import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  TestCaseName,
  createRule,
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

export default createRule({
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
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },
  defaultOptions: [{ ignoreTypeOfDescribeName: false }],
  create(context, [{ ignoreTypeOfDescribeName }]) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!(isDescribe(node) || isTestCase(node)) || !node.arguments.length) {
          return;
        }

        const [argument] = node.arguments;

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

        if (title.trim().length !== title.length) {
          context.report({
            messageId: 'accidentalSpace',
            node: argument,
            fix(fixer) {
              const stringValue =
                argument.type === AST_NODE_TYPES.TemplateLiteral
                  ? `\`${argument.quasis[0].value.raw}\``
                  : argument.raw;

              return [
                fixer.replaceTextRange(
                  argument.range,
                  stringValue
                    .replace(/^([`'"]) +?/, '$1')
                    .replace(/ +?([`'"])$/, '$1'),
                ),
              ];
            },
          });
        }

        const nodeName = trimFXprefix(getNodeName(node.callee));
        const [firstWord] = title.split(' ');

        if (firstWord.toLowerCase() === nodeName) {
          context.report({
            messageId: 'duplicatePrefix',
            node: argument,
            fix(fixer) {
              const stringValue =
                argument.type === AST_NODE_TYPES.TemplateLiteral
                  ? `\`${argument.quasis[0].value.raw}\``
                  : argument.raw;

              return [
                fixer.replaceTextRange(
                  argument.range,
                  stringValue.replace(/^([`'"]).+? /, '$1'),
                ),
              ];
            },
          });
        }
      },
    };
  },
});
