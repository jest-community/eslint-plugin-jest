import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  createRule,
  getAccessorValue,
  getFirstMatcherArg,
  parseJestFnCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest using `toHaveBeenCalled`',
    },
    messages: {
      preferMatcher: 'Use `toHaveBeenCalled`',
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [],
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

        if (
          !['toBeCalledTimes', 'toHaveBeenCalledTimes'].includes(
            getAccessorValue(matcher),
          )
        ) {
          return;
        }

        const arg = getFirstMatcherArg(jestFnCall);

        if (arg.type !== AST_NODE_TYPES.Literal || arg.value !== 0) {
          return;
        }

        const notModifier = jestFnCall.modifiers.find(
          nod => getAccessorValue(nod) === 'not',
        );

        context.report({
          messageId: 'preferMatcher',
          node: matcher,
          fix(fixer) {
            let replacementMatcher = '.not.toHaveBeenCalled';

            if (notModifier) {
              replacementMatcher = '.toHaveBeenCalled';
            }

            return [
              // remove all the arguments to the matcher
              fixer.removeRange([
                jestFnCall.args[0].range[0],
                jestFnCall.args[jestFnCall.args.length - 1].range[1],
              ]),
              // replace the current matcher with "(.not).toHaveBeenCalled"
              fixer.replaceTextRange(
                [
                  (notModifier || matcher).parent.object.range[1],
                  jestFnCall.matcher.parent.range[1],
                ],
                replacementMatcher,
              ),
            ];
          },
        });
      },
    };
  },
});
