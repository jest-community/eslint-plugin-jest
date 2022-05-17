import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  createRule,
  isExpectCall,
  isParsedEqualityMatcherCall,
  isSupportedAccessor,
  parseExpectCall,
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
        if (!isExpectCall(node, context.getScope())) {
          return;
        }

        const {
          expect: {
            arguments: [argument],
          },
          matcher,
        } = parseExpectCall(node);

        if (
          !matcher ||
          !isParsedEqualityMatcherCall(matcher) ||
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
                [matcher.node.object.range[1], matcher.node.range[1]],
                '.toHaveLength',
              ),
            ];
          },
          messageId: 'useToHaveLength',
          node: matcher.node.property,
        });
      },
    };
  },
});
