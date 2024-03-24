import {
  createRule,
  getAccessorValue,
  parseJestFnCall,
  replaceAccessorFixer,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow alias methods',
    },
    messages: {
      replaceAlias: `Replace {{ alias }}() with its canonical name of {{ canonical }}()`,
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // map of jest matcher aliases & their canonical names
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
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const { matcher } = jestFnCall;

        const alias = getAccessorValue(matcher);

        if (alias in methodNames) {
          const canonical = methodNames[alias];

          context.report({
            messageId: 'replaceAlias',
            data: { alias, canonical },
            node: matcher,
            fix: fixer => [replaceAccessorFixer(fixer, matcher, canonical)],
          });
        }
      },
    };
  },
});
