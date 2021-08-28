import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  ParsedEqualityMatcherCall,
  ParsedExpectMatcher,
  createRule,
  followTypeAssertionChain,
  isExpectCall,
  isParsedEqualityMatcherCall,
  parseExpectCall,
} from './utils';

interface UndefinedIdentifier extends TSESTree.Identifier {
  name: 'undefined';
}

const isUndefinedIdentifier = (
  node: TSESTree.Node,
): node is UndefinedIdentifier =>
  node.type === AST_NODE_TYPES.Identifier && node.name === 'undefined';

/**
 * Checks if the given `ParsedExpectMatcher` is a call to one of the equality matchers,
 * with a `undefined` identifier as the sole argument.
 *
 * @param {ParsedExpectMatcher} matcher
 *
 * @return {matcher is ParsedEqualityMatcherCall<MaybeTypeCast<UndefinedIdentifier>>}
 */
const isUndefinedEqualityMatcher = (
  matcher: ParsedExpectMatcher,
): matcher is ParsedEqualityMatcherCall<UndefinedIdentifier> =>
  isParsedEqualityMatcherCall(matcher) &&
  isUndefinedIdentifier(followTypeAssertionChain(matcher.arguments[0]));

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest using `toBeUndefined()`',
      recommended: false,
    },
    messages: {
      useToBeUndefined: 'Use toBeUndefined() instead',
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

        if (matcher && isUndefinedEqualityMatcher(matcher)) {
          context.report({
            fix: fixer => [
              fixer.replaceText(matcher.node.property, 'toBeUndefined'),
              fixer.remove(matcher.arguments[0]),
            ],
            messageId: 'useToBeUndefined',
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
