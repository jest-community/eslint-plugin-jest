import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  EqualityMatcher,
  MaybeTypeCast,
  ModifierName,
  ParsedEqualityMatcherCall,
  ParsedExpectMatcher,
  ParsedExpectModifier,
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

type MessageId =
  | 'useToBe'
  | 'useToBeUndefined'
  | 'useToBeDefined'
  | 'useToBeNull'
  | 'useToBeNaN';

type ToBeWhat = MessageId extends `useToBe${infer M}` ? M : never;

const reportPreferToBe = (
  context: TSESLint.RuleContext<MessageId, unknown[]>,
  whatToBe: ToBeWhat,
  matcher: ParsedExpectMatcher,
  modifier?: ParsedExpectModifier,
) => {
  const modifierNode = modifier?.negation || modifier?.node;

  context.report({
    messageId: `useToBe${whatToBe}`,
    fix(fixer) {
      const fixes = [
        fixer.replaceText(matcher.node.property, `toBe${whatToBe}`),
      ];

      if (matcher.arguments?.length && whatToBe !== '') {
        fixes.push(fixer.remove(matcher.arguments[0]));
      }

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
    node: matcher.node.property,
  });
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
          reportPreferToBe(
            context,
            matcher.name === 'toBeDefined' ? 'Undefined' : 'Defined',
            matcher,
            modifier,
          );

          return;
        }

        if (!isParsedEqualityMatcherCall(matcher)) {
          return;
        }

        if (isNullEqualityMatcher(matcher)) {
          reportPreferToBe(context, 'Null', matcher);

          return;
        }

        if (isUndefinedEqualityMatcher(matcher)) {
          const name =
            modifier &&
            (modifier.name === ModifierName.not || modifier.negation)
              ? 'Defined'
              : 'Undefined';

          reportPreferToBe(context, name, matcher, modifier);

          return;
        }

        if (isNaNEqualityMatcher(matcher)) {
          reportPreferToBe(context, 'NaN', matcher);

          return;
        }

        if (
          isPrimitiveLiteral(matcher) &&
          !isParsedEqualityMatcherCall(matcher, EqualityMatcher.toBe)
        ) {
          reportPreferToBe(context, '', matcher);
        }
      },
    };
  },
});