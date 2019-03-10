'use strict';

const { expectCase, getDocsUrl, method } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    fixable: 'code',
    schema: [
      {
        enum: ['canonical', 'short'],
      },
    ],
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
    ];

    // Default to "canonical" (!short) if no option
    const canonical = context.options[0] !== 'short';

    const desirableColumn = canonical ? 0 : 1;
    const undesirableColumn = canonical ? 1 : 0;

    const report = (targetNode, undesirable, desirable) =>
      context.report({
        message: `Replace {{ undesirable }}() with its {{ description }} name of {{ desirable }}()`,
        data: {
          undesirable,
          description: canonical ? 'canonical' : 'short',
          desirable,
        },
        node: targetNode,
        fix: fixer => [fixer.replaceText(targetNode, desirable)],
      });

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

        // Special case, the alias is longer
        if (targetNode.name === 'toThrowError')
          return report(targetNode, 'toThrowError', 'toThrow');

        // Check if the method used matches any of ours
        const methodItem = methodNames.find(
          item => item[undesirableColumn] === targetNode.name
        );
        if (methodItem)
          report(
            targetNode,
            methodItem[undesirableColumn],
            methodItem[desirableColumn]
          );
      },
    };
  },
};
