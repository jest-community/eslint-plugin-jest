import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  EqualityMatcher,
  MaybeTypeCast,
  ParsedEqualityMatcherCall,
  ParsedExpectMatcher,
  createRule,
  followTypeAssertionChain,
  isExpectCall,
  isParsedEqualityMatcherCall,
  parseExpectCall,
} from './utils';

const isNullLiteral = (node: TSESTree.Node): node is TSESTree.NullLiteral =>
  node.type === AST_NODE_TYPES.Literal && node.value === null;

/**
 * Checks if the given `ParsedExpectMatcher` is a call to one of the equality matchers,
 * with a `null` literal as the sole argument.
 *
 * @param {ParsedExpectMatcher} matcher
 *
 * @return {matcher is ParsedEqualityMatcherCall<MaybeTypeCast<NullLiteral>>}
 */
const isNullEqualityMatcher = (
  matcher: ParsedExpectMatcher,
): matcher is ParsedEqualityMatcherCall<MaybeTypeCast<TSESTree.NullLiteral>> =>
  isParsedEqualityMatcherCall(matcher) &&
  isNullLiteral(followTypeAssertionChain(matcher.arguments[0]));

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

interface NaNIdentifier extends TSESTree.Identifier {
  name: 'NaN';
}

const isNaNIdentifier = (node: TSESTree.Node): node is NaNIdentifier =>
  node.type === AST_NODE_TYPES.Identifier && node.name === 'NaN';

/**
 * Checks if the given `ParsedExpectMatcher` is a call to one of the equality matchers,
 * with a `NaN` identifier as the sole argument.
 *
 * @param {ParsedExpectMatcher} matcher
 *
 * @return {matcher is ParsedEqualityMatcherCall<MaybeTypeCast<NaNIdentifier>>}
 */
const isNaNEqualityMatcher = (
  matcher: ParsedExpectMatcher,
): matcher is ParsedEqualityMatcherCall<NaNIdentifier> =>
  isParsedEqualityMatcherCall(matcher) &&
  isNaNIdentifier(followTypeAssertionChain(matcher.arguments[0]));

const isPrimitiveLiteral = (matcher: ParsedExpectMatcher) =>
  isParsedEqualityMatcherCall(matcher) &&
  followTypeAssertionChain(matcher.arguments[0]).type ===
    AST_NODE_TYPES.Literal;

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toBe()` for primitive literals',
      recommended: false,
    },
    messages: {
      useToBe: 'Use `toBe` when expecting primitive literals',
      useToBeUndefined: 'Use `toBeUndefined` instead',
      useToBeNull: 'Use `toBeNull` instead',
      useToBeNaN: 'Use `toBeNaN` instead',
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

        if (!matcher || !isParsedEqualityMatcherCall(matcher)) {
          return;
        }

        if (isNullEqualityMatcher(matcher)) {
          context.report({
            fix: fixer => [
              fixer.replaceText(matcher.node.property, 'toBeNull'),
              fixer.remove(matcher.arguments[0]),
            ],
            messageId: 'useToBeNull',
            node: matcher.node.property,
          });

          return;
        }

        if (isUndefinedEqualityMatcher(matcher)) {
          context.report({
            fix: fixer => [
              fixer.replaceText(matcher.node.property, 'toBeUndefined'),
              fixer.remove(matcher.arguments[0]),
            ],
            messageId: 'useToBeUndefined',
            node: matcher.node.property,
          });

          return;
        }

        if (isNaNEqualityMatcher(matcher)) {
          context.report({
            fix: fixer => [
              fixer.replaceText(matcher.node.property, 'toBeNaN'),
              fixer.remove(matcher.arguments[0]),
            ],
            messageId: 'useToBeNaN',
            node: matcher.node.property,
          });

          return;
        }

        if (
          isPrimitiveLiteral(matcher) &&
          !isParsedEqualityMatcherCall(matcher, EqualityMatcher.toBe)
        ) {
          context.report({
            fix: fixer => fixer.replaceText(matcher.node.property, 'toBe'),
            messageId: 'useToBe',
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
