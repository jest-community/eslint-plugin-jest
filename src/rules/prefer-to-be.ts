import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  type AccessorNode,
  EqualityMatcher,
  type ParsedExpectFnCall,
  createRule,
  getAccessorValue,
  getFirstMatcherArg,
  isIdentifier,
  parseJestFnCall,
  removeExtraArgumentsFixer,
  replaceAccessorFixer,
} from './utils';

const isNullLiteral = (node: TSESTree.Node): node is TSESTree.NullLiteral =>
  node.type === AST_NODE_TYPES.Literal && node.value === null;

/**
 * Checks if the given `ParsedEqualityMatcherCall` is a call to one of the equality matchers,
 * with a `null` literal as the sole argument.
 */
const isNullEqualityMatcher = (expectFnCall: ParsedExpectFnCall) =>
  isNullLiteral(getFirstMatcherArg(expectFnCall));

const isFirstArgumentIdentifier = (
  expectFnCall: ParsedExpectFnCall,
  name: string,
) => isIdentifier(getFirstMatcherArg(expectFnCall), name);

const shouldUseToBe = (expectFnCall: ParsedExpectFnCall): boolean => {
  let firstArg = getFirstMatcherArg(expectFnCall);

  if (
    firstArg.type === AST_NODE_TYPES.UnaryExpression &&
    firstArg.operator === '-'
  ) {
    firstArg = firstArg.argument;
  }

  if (firstArg.type === AST_NODE_TYPES.Literal) {
    // regex literals are classed as literals, but they're actually objects
    // which means "toBe" will give different results than other matchers
    return !('regex' in firstArg);
  }

  return firstArg.type === AST_NODE_TYPES.TemplateLiteral;
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
  expectFnCall: ParsedExpectFnCall,
  func: TSESTree.CallExpression,
  modifierNode?: AccessorNode,
) => {
  context.report({
    messageId: `useToBe${whatToBe}`,
    fix(fixer) {
      const fixes = [
        replaceAccessorFixer(fixer, expectFnCall.matcher, `toBe${whatToBe}`),
      ];

      if (expectFnCall.args?.length && whatToBe !== '') {
        fixes.push(removeExtraArgumentsFixer(fixer, context, func, 0));
      }

      if (modifierNode) {
        fixes.push(
          fixer.removeRange([modifierNode.range[0] - 1, modifierNode.range[1]]),
        );
      }

      return fixes;
    },
    node: expectFnCall.matcher,
  });
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest using `toBe()` for primitive literals',
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
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const matcherName = getAccessorValue(jestFnCall.matcher);
        const notModifier = jestFnCall.modifiers.find(
          nod => getAccessorValue(nod) === 'not',
        );

        if (
          notModifier &&
          ['toBeUndefined', 'toBeDefined'].includes(matcherName)
        ) {
          reportPreferToBe(
            context,
            matcherName === 'toBeDefined' ? 'Undefined' : 'Defined',
            jestFnCall,
            node,
            notModifier,
          );

          return;
        }

        if (
          !EqualityMatcher.hasOwnProperty(matcherName) ||
          jestFnCall.args.length === 0
        ) {
          return;
        }

        if (isNullEqualityMatcher(jestFnCall)) {
          reportPreferToBe(context, 'Null', jestFnCall, node);

          return;
        }

        if (isFirstArgumentIdentifier(jestFnCall, 'undefined')) {
          const name = notModifier ? 'Defined' : 'Undefined';

          reportPreferToBe(context, name, jestFnCall, node, notModifier);

          return;
        }

        if (isFirstArgumentIdentifier(jestFnCall, 'NaN')) {
          reportPreferToBe(context, 'NaN', jestFnCall, node);

          return;
        }

        if (shouldUseToBe(jestFnCall) && matcherName !== EqualityMatcher.toBe) {
          reportPreferToBe(context, '', jestFnCall, node);
        }
      },
    };
  },
});
