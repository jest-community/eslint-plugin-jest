import { createRule, isExpectCall, parseExpectCall } from './utils';

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
    // The Jest methods which have aliases. The canonical name is the first index of each item.
    const methodNames: Record<string, string> = {
      toBeCalled: 'toHaveBeenCalled',
      toBeCalledTimes: 'toHaveBeenCalledTimes',
      toBeCalledWith: 'toHaveBeenCalledWith',
      lastCalledWith: 'toHaveBeenLastCalledWith',
      nthCalledWith: 'toHaveBeenNthCalledWith',
      toReturn: 'toHaveReturned',
      toReturnTimes: 'toHaveReturnedTimes',
      toReturnWith: 'toHaveReturnedWith',
      lastReturnedWith: 'toHaveLastReturnedWith',
      nthReturnedWith: 'toHaveNthReturnedWith',
      toThrowError: 'toThrow',
    };

    return {
      CallExpression(node) {
        if (!isExpectCall(node)) {
          return;
        }

        const { matcher } = parseExpectCall(node);

        if (!matcher) {
          return;
        }

        const alias = matcher.name;
        if (alias in methodNames) {
          const canonical = methodNames[alias];

          context.report({
            messageId: 'replaceAlias',
            data: {
              replace: alias,
              canonical,
            },
            node: matcher.node.property,
            fix: fixer => [fixer.replaceText(matcher.node.property, canonical)],
          });
        }
      },
    };
  },
});
