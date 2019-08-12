import { createRule, isExpectCall, parseExpectCall } from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow alias methods',
      recommended: 'warn',
    },
    messages: {
      replaceAlias: `Replace {{ replace }}() with its canonical name of {{ canonical }}()`,
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // The Jest methods which have aliases. The canonical name is the first
    // index of each item.
    // todo: replace w/ Map
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
        if (!isExpectCall(node)) {
          return;
        }

        const { matcher } = parseExpectCall(node);

        if (!matcher) {
          return;
        }

        // Check if the method used matches any of ours
        const methodItem = methodNames.find(item => item[1] === matcher.name);

        if (methodItem) {
          context.report({
            messageId: 'replaceAlias',
            data: {
              replace: methodItem[1],
              canonical: methodItem[0],
            },
            node: matcher.node.property,
            fix: fixer => [
              fixer.replaceText(matcher.node.property, methodItem[0]),
            ],
          });
        }
      },
    };
  },
});
