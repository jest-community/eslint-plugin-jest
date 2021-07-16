import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  EqualityMatcher,
  MaybeTypeCast,
  ModifierName,
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
      useToBeDefined: 'Use `toBeDefined` instead',
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

        const { matcher, modifier } = parseExpectCall(node);

        if (!matcher) {
          return;
        }

        if (
          modifier &&
          (modifier.name === ModifierName.not || modifier.negation) &&
          ['toBeUndefined', 'toBeDefined'].includes(matcher.name)
        ) {
          const modifierNode = modifier.negation || modifier.node;
          const name = matcher.name === 'toBeDefined' ? 'Undefined' : 'Defined';

          context.report({
            fix: fixer => [
              fixer.replaceText(matcher.node.property, `toBe${name}`),
              fixer.removeRange([
                modifierNode.property.range[0] - 1,
                modifierNode.property.range[1],
              ]),
            ],
            messageId: `useToBe${name}`,
            node: matcher.node.property,
          });

          return;
        }

        if (!isParsedEqualityMatcherCall(matcher)) {
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
          const name =
            modifier &&
            (modifier.name === ModifierName.not || modifier.negation)
              ? 'Defined'
              : 'Undefined';

          context.report({
            fix(fixer) {
              const fixes = [
                fixer.replaceText(matcher.node.property, `toBe${name}`),
                fixer.remove(matcher.arguments[0]),
              ];

              const modifierNode = modifier?.negation || modifier?.node;

              if (modifierNode) {
                fixes.push(
                  fixer.removeRange([
                    modifierNode.property.range[0] - 1,
                    modifierNode.property.range[1],
                  ]),
                );
              }

              return fixes;
            },
            messageId: `useToBe${name}`,
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
