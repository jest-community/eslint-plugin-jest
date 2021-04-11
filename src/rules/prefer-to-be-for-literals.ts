import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import {
  ParsedExpectMatcher,
  createRule,
  followTypeAssertionChain,
  isExpectCall,
  isParsedEqualityMatcherCall,
  parseExpectCall,
} from './utils';

const isPrimitiveLiteral = (matcher: ParsedExpectMatcher) =>
  isParsedEqualityMatcherCall(matcher) &&
  followTypeAssertionChain(matcher.arguments[0]).type ===
    AST_NODE_TYPES.Literal;

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `tooBe()` for primitive literals',
      recommended: false,
    },
    messages: {
      useToBe: 'Use `toBe` when expecting primitive literals',
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

        if (matcher && isPrimitiveLiteral(matcher)) {
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
