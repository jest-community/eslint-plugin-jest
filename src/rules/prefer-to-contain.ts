import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  CallExpressionWithSingleArgument,
  KnownCallExpression,
  MaybeTypeCast,
  ModifierName,
  ParsedEqualityMatcherCall,
  ParsedExpectMatcher,
  createRule,
  followTypeAssertionChain,
  hasOnlyOneArgument,
  isExpectCall,
  isParsedEqualityMatcherCall,
  isSupportedAccessor,
  parseExpectCall,
} from './utils';

const isBooleanLiteral = (
  node: TSESTree.Node,
): node is TSESTree.BooleanLiteral =>
  node.type === AST_NODE_TYPES.Literal && typeof node.value === 'boolean';

type ParsedBooleanEqualityMatcherCall = ParsedEqualityMatcherCall<
  MaybeTypeCast<TSESTree.BooleanLiteral>
>;

/**
 * Checks if the given `ParsedExpectMatcher` is a call to one of the equality matchers,
 * with a boolean literal as the sole argument.
 *
 * @example javascript
 * toBe(true);
 * toEqual(false);
 *
 * @param {ParsedExpectMatcher} matcher
 *
 * @return {matcher is ParsedBooleanEqualityMatcher}
 */
const isBooleanEqualityMatcher = (
  matcher: ParsedExpectMatcher,
): matcher is ParsedBooleanEqualityMatcherCall =>
  isParsedEqualityMatcherCall(matcher) &&
  isBooleanLiteral(followTypeAssertionChain(matcher.arguments[0]));

type FixableIncludesCallExpression = KnownCallExpression<'includes'> &
  CallExpressionWithSingleArgument;

/**
 * Checks if the given `node` is a `CallExpression` representing the calling
 * of an `includes`-like method that can be 'fixed' (using `toContain`).
 *
 * @param {CallExpression} node
 *
 * @return {node is FixableIncludesCallExpression}
 */
const isFixableIncludesCallExpression = (
  node: TSESTree.Node,
): node is FixableIncludesCallExpression =>
  node.type === AST_NODE_TYPES.CallExpression &&
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(node.callee.property, 'includes') &&
  hasOnlyOneArgument(node);

// expect(array.includes(<value>)[not.]{toBe,toEqual}(<boolean>)
export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toContain()`',
      recommended: false,
    },
    messages: {
      useToContain: 'Use toContain() instead',
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
            arguments: [includesCall],
            range: [, expectCallEnd],
          },
          matcher,
          modifier,
        } = parseExpectCall(node);

        if (
          !matcher ||
          !includesCall ||
          (modifier && modifier.name !== ModifierName.not) ||
          !isBooleanEqualityMatcher(matcher) ||
          !isFixableIncludesCallExpression(includesCall)
        ) {
          return;
        }

        context.report({
          fix(fixer) {
            const sourceCode = context.getSourceCode();

            // we need to negate the expectation if the current expected
            // value is itself negated by the "not" modifier
            const addNotModifier =
              followTypeAssertionChain(matcher.arguments[0]).value ===
              !!modifier;

            return [
              // remove the "includes" call entirely
              fixer.removeRange([
                includesCall.callee.property.range[0] - 1,
                includesCall.range[1],
              ]),
              // replace the current matcher with "toContain", adding "not" if needed
              fixer.replaceTextRange(
                [expectCallEnd, matcher.node.range[1]],
                addNotModifier
                  ? `.${ModifierName.not}.toContain`
                  : '.toContain',
              ),
              // replace the matcher argument with the value from the "includes"
              fixer.replaceText(
                matcher.arguments[0],
                sourceCode.getText(includesCall.arguments[0]),
              ),
            ];
          },
          messageId: 'useToContain',
          node: (modifier || matcher).node.property,
        });
      },
    };
  },
});
