import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  MaybeTypeCast,
  ModifierName,
  ParsedEqualityMatcherCall,
  ParsedExpectMatcher,
  createRule,
  followTypeAssertionChain,
  isExpectCall,
  isParsedEqualityMatcherCall,
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

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using the built-in equality matchers',
      recommended: false,
      suggestion: true,
    },
    messages: {
      useEqualityMatcher: 'Prefer using one of the equality matchers instead',
      suggestEqualityMatcher: 'Use `{{ equalityMatcher }}`',
    },
    hasSuggestions: true,
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
            arguments: [comparison],
            range: [, expectCallEnd],
          },
          matcher,
          modifier,
        } = parseExpectCall(node);

        if (
          !matcher ||
          comparison?.type !== AST_NODE_TYPES.BinaryExpression ||
          (comparison.operator !== '===' && comparison.operator !== '!==') ||
          !isBooleanEqualityMatcher(matcher)
        ) {
          return;
        }

        const matcherValue = followTypeAssertionChain(
          matcher.arguments[0],
        ).value;

        // we need to negate the expectation if the current expected
        // value is itself negated by the "not" modifier
        const addNotModifier =
          (comparison.operator === '!==' ? !matcherValue : matcherValue) ===
          !!modifier;

        const buildFixer =
          (equalityMatcher: string): TSESLint.ReportFixFunction =>
          fixer => {
            const sourceCode = context.getSourceCode();

            return [
              // replace the comparison argument with the left-hand side of the comparison
              fixer.replaceText(
                comparison,
                sourceCode.getText(comparison.left),
              ),
              // replace the current matcher & modifier with the preferred matcher
              fixer.replaceTextRange(
                [expectCallEnd, matcher.node.range[1]],
                addNotModifier
                  ? `.${ModifierName.not}.${equalityMatcher}`
                  : `.${equalityMatcher}`,
              ),
              // replace the matcher argument with the right-hand side of the comparison
              fixer.replaceText(
                matcher.arguments[0],
                sourceCode.getText(comparison.right),
              ),
            ];
          };

        context.report({
          messageId: 'useEqualityMatcher',
          suggest: ['toBe', 'toEqual', 'toStrictEqual'].map(
            equalityMatcher => ({
              messageId: 'suggestEqualityMatcher',
              data: { equalityMatcher },
              fix: buildFixer(equalityMatcher),
            }),
          ),
          node: (modifier || matcher).node.property,
        });
      },
    };
  },
});
