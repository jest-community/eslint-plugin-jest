'use strict';

const { expectCase, getDocsUrl, method } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      replaceAlias: `Replace {{ replace }}() with its canonical name of {{ canonical }}()`,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    // The Jest methods which have aliases. The canonical name is the first
    // index of each item.
    const methodNames = [
      ['toHaveBeenCalled', 'toBeCalled'],
      ['toHaveBeenCalledTimes', 'toBeCalledTimes'],
      ['toHaveBeenCalledWith', 'toBeCalledWith'],
      ['toHaveBeenLastCalledWith', 'lastCalledWith'],
      ['toHaveBeenNthCalledWith', 'nthCalledWith'],
      ['toHaveReturned', 'toReturn'],
      ['toHaveReturnedTimes', 'toReturnTimes'],
      ['toHaveReturnedWith', 'toReturnWith'],
      ['toHaveLastReturnedWith', 'lastReturnedWith'],
      ['toHaveNthReturnedWith', 'nthReturnedWith'],
      ['toThrow', 'toThrowError'],
    ];

    return {
      CallExpression(node) {
        if (!expectCase(node)) {
          return;
        }

        let targetNode = method(node);
        if (
          targetNode.name === 'resolves' ||
          targetNode.name === 'rejects' ||
          targetNode.name === 'not'
        ) {
          targetNode = method(node.parent);
        }

        if (!targetNode) {
          return;
        }

        // Check if the method used matches any of ours
        const methodItem = methodNames.find(
          item => item[1] === targetNode.name,
        );

        if (methodItem) {
          context.report({
            messageId: 'replaceAlias',
            data: {
              replace: methodItem[1],
              canonical: methodItem[0],
            },
            node: targetNode,
            fix: fixer => [fixer.replaceText(targetNode, methodItem[0])],
          });
        }
      },
    };
  },
};
