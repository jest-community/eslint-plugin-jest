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
            const accessorStartToken = context
              .getSourceCode()
              .getFirstTokenBetween(
                argument.object,
                argument.property,
                token => token.value === '.' || token.value === '[',
              );

            /* istanbul ignore if */
            if (accessorStartToken === null) {
              throw new Error(
                `Unexpected null when attempting to fix ${context.getFilename()} - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
              );
            }

            const fixers = [
              fixer.remove(accessorStartToken),
              fixer.remove(argument.property),
              fixer.replaceText(matcher.node.property, 'toHaveLength'),
            ];

            if (accessorStartToken.value === '[') {
              const accessorStopToken = context
                .getSourceCode()
                .getTokenAfter(argument.property);

              /* istanbul ignore if */
              if (accessorStopToken === null) {
                throw new Error(
                  `Unexpected null when attempting to fix ${context.getFilename()} - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
                );
              }

              fixers.push(fixer.remove(accessorStopToken));
            }

            return fixers;
          },
          messageId: 'useToHaveLength',
          node: matcher.node.property,
        });
      },
    };
  },
});
