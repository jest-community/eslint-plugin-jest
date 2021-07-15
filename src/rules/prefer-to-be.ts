import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  EqualityMatcher,
  MaybeTypeCast,
  ParsedEqualityMatcherCall,
  createRule,
  followTypeAssertionChain,
  isExpectCall,
  isIdentifier,
  isParsedEqualityMatcherCall,
  parseExpectCall,
} from './utils';

const isNullLiteral = (node: TSESTree.Node): node is TSESTree.NullLiteral =>
  node.type === AST_NODE_TYPES.Literal && node.value === null;

/**
 * Checks if the given `ParsedEqualityMatcherCall` is a call to one of the equality matchers,
 * with a `null` literal as the sole argument.
 */
const isNullEqualityMatcher = (
  matcher: ParsedEqualityMatcherCall,
): matcher is ParsedEqualityMatcherCall<MaybeTypeCast<TSESTree.NullLiteral>> =>
  isNullLiteral(getFirstArgument(matcher));

interface UndefinedIdentifier extends TSESTree.Identifier {
  name: 'undefined';
}

/**
 * Checks if the given `ParsedEqualityMatcherCall` is a call to one of the equality matchers,
 * with a `undefined` identifier as the sole argument.
 */
const isUndefinedEqualityMatcher = (
  matcher: ParsedEqualityMatcherCall,
): matcher is ParsedEqualityMatcherCall<UndefinedIdentifier> =>
  isIdentifier(getFirstArgument(matcher), 'undefined');

interface NaNIdentifier extends TSESTree.Identifier {
  name: 'NaN';
}

/**
 * Checks if the given `ParsedEqualityMatcherCall` is a call to one of the equality matchers,
 * with a `NaN` identifier as the sole argument.
 */
const isNaNEqualityMatcher = (
  matcher: ParsedEqualityMatcherCall,
): matcher is ParsedEqualityMatcherCall<NaNIdentifier> =>
  isIdentifier(getFirstArgument(matcher), 'NaN');

const isPrimitiveLiteral = (matcher: ParsedEqualityMatcherCall) =>
  getFirstArgument(matcher).type === AST_NODE_TYPES.Literal;

const getFirstArgument = (matcher: ParsedEqualityMatcherCall) => {
  return followTypeAssertionChain(matcher.arguments[0]);
};

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
