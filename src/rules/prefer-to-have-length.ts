import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  EqualityMatcher,
  createRule,
  getAccessorValue,
  isSupportedAccessor,
  parseJestFnCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toHaveLength()`',
      recommended: false,
    },
    messages: {
      useToHaveLength: 'Use toHaveLength() instead',
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

        const { parent: expect } = jestFnCall.head.node;

        if (expect?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const [argument] = expect.arguments;
        const matcher = jestFnCall.members[jestFnCall.members.length - 1];

        if (
          !matcher ||
          !EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) ||
          argument?.type !== AST_NODE_TYPES.MemberExpression ||
          !isSupportedAccessor(argument.property, 'length')
        ) {
          return;
        }

        context.report({
          fix(fixer) {
            return [
              // remove the "length" property accessor
              fixer.removeRange([
                argument.property.range[0] - 1,
                argument.range[1],
              ]),
              // replace the current matcher with "toHaveLength"
              fixer.replaceTextRange(
                [matcher.parent.object.range[1], matcher.parent.range[1]],
                '.toHaveLength',
              ),
            ];
          },
          messageId: 'useToHaveLength',
          node: matcher,
        });
      },
    };
  },
});
