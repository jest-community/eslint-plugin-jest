import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
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
        if (!isExpectCall(node)) {
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
              fixer.removeRange([
                argument.property.range[0] - 1,
                argument.range[1],
              ]),
              fixer.replaceText(matcher.node.property, 'toHaveLength'),
            ];
          },
          messageId: 'useToHaveLength',
          node: matcher.node.property,
        });
      },
    };
  },
});
