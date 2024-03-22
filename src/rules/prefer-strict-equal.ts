import {
  EqualityMatcher,
  createRule,
  isSupportedAccessor,
  parseJestFnCall,
  replaceAccessorFixer,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest using `toStrictEqual()`',
    },
    messages: {
      useToStrictEqual: 'Use `toStrictEqual()` instead',
      suggestReplaceWithStrictEqual: 'Replace with `toStrictEqual()`',
    },
    type: 'suggestion',
    schema: [],
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const { matcher } = jestFnCall;

        if (isSupportedAccessor(matcher, 'toEqual')) {
          context.report({
            messageId: 'useToStrictEqual',
            node: matcher,
            suggest: [
              {
                messageId: 'suggestReplaceWithStrictEqual',
                fix: fixer => [
                  replaceAccessorFixer(
                    fixer,
                    matcher,
                    EqualityMatcher.toStrictEqual,
                  ),
                ],
              },
            ],
          });
        }
      },
    };
  },
});
