import {
  createRule,
  getNodeName,
  getStringValue,
  isDescribe,
  isStringNode,
  isTestCase,
} from './utils';

import { TSESTree } from '@typescript-eslint/experimental-utils';

const trimFXprefix = (word: string) =>
  ['f', 'x'].includes(word.charAt(0)) ? word.substr(1) : word;

const getNodeTitle = (node: TSESTree.CallExpression): string | null => {
  const [argument] = node.arguments;

  return isStringNode(argument) ? getStringValue(argument) : null;
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
      duplicatePrefix: 'should not have duplicate prefix',
      accidentalSpace: 'should not have space in the beginning',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isDescribe(node) && !isTestCase(node)) return;

        const title = getNodeTitle(node);
        if (!title) return;

        if (title.trimLeft().length !== title.length) {
          context.report({
            messageId: 'accidentalSpace',
            node,
          });
        }

        const nodeName = trimFXprefix(getNodeName(node.callee));
        const [firstWord] = title.split(' ');

        if (firstWord.toLowerCase() === nodeName) {
          context.report({
            messageId: 'duplicatePrefix',
            node,
          });
        }
      },
    };
  },
});
