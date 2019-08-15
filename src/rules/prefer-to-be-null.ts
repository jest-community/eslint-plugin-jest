import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  ParsedEqualityMatcherCall,
  ParsedExpectMatcher,
  createRule,
  isExpectCall,
  isParsedEqualityMatcherCall,
  parseExpectCall,
} from './utils';

interface NullLiteral extends TSESTree.Literal {
  value: null;
}

const isNullLiteral = (node: TSESTree.Node): node is NullLiteral =>
  node.type === AST_NODE_TYPES.Literal && node.value === null;

/**
 * Checks if the given `ParsedExpectMatcher` is a call to one of the equality matchers,
 * with a `null` literal as the sole argument.
 *
 * @param {ParsedExpectMatcher} matcher
 *
 * @return {matcher is ParsedEqualityMatcherCall<NullLiteral>}
 */
const isNullEqualityMatcher = (
  matcher: ParsedExpectMatcher,
): matcher is ParsedEqualityMatcherCall<NullLiteral> =>
  isParsedEqualityMatcherCall(matcher) && isNullLiteral(matcher.arguments[0]);

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toBeNull()`',
      recommended: false,
    },
    messages: {
      useToBeNull: 'Use toBeNull() instead',
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

        const { matcher } = parseExpectCall(node);

        if (matcher && isNullEqualityMatcher(matcher)) {
          context.report({
            fix: fixer => [
              fixer.replaceText(matcher.node.property, 'toBeNull'),
              fixer.remove(matcher.arguments[0]),
            ],
            messageId: 'useToBeNull',
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
