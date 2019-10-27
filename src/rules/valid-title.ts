import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getNodeName,
  getStringValue,
  isDescribe,
  isStringNode,
  isTestCase,
} from './utils';

const trimFXprefix = (word: string) =>
  ['f', 'x'].includes(word.charAt(0)) ? word.substr(1) : word;

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce valid titles',
      recommended: false,
    },
    messages: {
      duplicatePrefix: 'should not have duplicate prefix',
      accidentalSpace: 'should not have space in the beginning',
    },
    type: 'suggestion',
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!(isDescribe(node) || isTestCase(node)) || !node.arguments.length) {
          return;
        }

        const [argument] = node.arguments;

        if (!isStringNode(argument)) {
          return;
        }

        const title = getStringValue(argument);

        if (!title) {
          return;
        }

        if (title.trimLeft().length !== title.length) {
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
                  stringValue.replace(/^([`'"]) +?/, '$1'),
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
          });
        }
      },
    };
  },
});
