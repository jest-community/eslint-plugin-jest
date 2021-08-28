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
          !isSupportedAccessor(argument.property, 'length') ||
          argument.property.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        context.report({
          fix(fixer) {
            const propertyDot = context
              .getSourceCode()
              .getFirstTokenBetween(
                argument.object,
                argument.property,
                token => token.value === '.',
              );

            /* istanbul ignore if */
            if (propertyDot === null) {
              throw new Error(
                `Unexpected null when attempting to fix ${context.getFilename()} - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
              );
            }

            return [
              fixer.remove(propertyDot),
              fixer.remove(argument.property),
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
