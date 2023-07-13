import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import {
  EqualityMatcher,
  ModifierName,
  createRule,
  getAccessorValue,
  getFirstMatcherArg,
  isBooleanLiteral,
  parseJestFnCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest using the built-in equality matchers',
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
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect' || jestFnCall.args.length === 0) {
          return;
        }

        const { parent: expect } = jestFnCall.head.node;

        if (expect?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const {
          arguments: [comparison],
          range: [, expectCallEnd],
        } = expect;

        const { matcher } = jestFnCall;
        const matcherArg = getFirstMatcherArg(jestFnCall);

        if (
          comparison?.type !== AST_NODE_TYPES.BinaryExpression ||
          (comparison.operator !== '===' && comparison.operator !== '!==') ||
          !EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) ||
          !isBooleanLiteral(matcherArg)
        ) {
          return;
        }

        const matcherValue = matcherArg.value;

        const [modifier] = jestFnCall.modifiers;
        const hasNot = jestFnCall.modifiers.some(
          nod => getAccessorValue(nod) === 'not',
        );

        // we need to negate the expectation if the current expected
        // value is itself negated by the "not" modifier
        const addNotModifier =
          (comparison.operator === '!==' ? !matcherValue : matcherValue) ===
          hasNot;

        const buildFixer =
          (equalityMatcher: string): TSESLint.ReportFixFunction =>
          fixer => {
            const sourceCode = context.getSourceCode();

            // preserve the existing modifier if it's not a negation
            let modifierText =
              modifier && getAccessorValue(modifier) !== 'not'
                ? `.${getAccessorValue(modifier)}`
                : '';

            if (addNotModifier) {
              modifierText += `.${ModifierName.not}`;
            }

            return [
              // replace the comparison argument with the left-hand side of the comparison
              fixer.replaceText(
                comparison,
                sourceCode.getText(comparison.left),
              ),
              // replace the current matcher & modifier with the preferred matcher
              fixer.replaceTextRange(
                [expectCallEnd, matcher.parent.range[1]],
                `${modifierText}.${equalityMatcher}`,
              ),
              // replace the matcher argument with the right-hand side of the comparison
              fixer.replaceText(
                matcherArg,
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
          node: matcher,
        });
      },
    };
  },
});
