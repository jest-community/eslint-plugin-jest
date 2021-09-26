import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  KnownCallExpression,
  createRule,
  getAccessorValue,
  isExpectCall,
  isSupportedAccessor,
  isTestCaseCall,
} from './utils';

type MessageIds = 'returnPromise';
type RuleContext = TSESLint.RuleContext<MessageIds, unknown[]>;

type PromiseChainCallExpression = KnownCallExpression<
  'then' | 'catch' | 'finally'
>;

const isPromiseChainCall = (
  node: TSESTree.Node,
): node is PromiseChainCallExpression =>
  node.type === AST_NODE_TYPES.CallExpression &&
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(node.callee.property) &&
  ['then', 'catch', 'finally'].includes(getAccessorValue(node.callee.property));

const reportReturnRequired = (context: RuleContext, node: TSESTree.Node) => {
  context.report({
    loc: {
      end: {
        column: node.loc.end.column,
        line: node.loc.end.line,
      },
      start: node.loc.start,
    },
    messageId: 'returnPromise',
    node,
  });
};

const findTopOfBodyNode = (
  node: PromiseChainCallExpression,
): TSESTree.Statement | null => {
  let { parent } = node;

  while (parent) {
    if (parent.parent && parent.parent.type === AST_NODE_TYPES.BlockStatement) {
      if (
        parent.parent.parent?.parent?.type === AST_NODE_TYPES.CallExpression &&
        isTestCaseCall(parent.parent.parent?.parent)
      ) {
        return parent as TSESTree.Statement;
      }
    }

    parent = parent.parent;
  }

  return null;
};

export default createRule<unknown[], MessageIds>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce having return statement when testing with promises',
      recommended: 'error',
    },
    messages: {
      returnPromise:
        'Promise should be returned to test its fulfillment or rejection',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let inPromiseChain = false;
    let hasExpectCall = false;

    return {
      CallExpression(node) {
        if (isPromiseChainCall(node)) {
          inPromiseChain = true;

          return;
        }

        if (!inPromiseChain) {
          return;
        }

        if (isExpectCall(node)) {
          hasExpectCall = true;

          return;
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (isPromiseChainCall(node)) {
          inPromiseChain = false;

          if (hasExpectCall) {
            const topNode = findTopOfBodyNode(node);

            if (!topNode) {
              return;
            }
            if (topNode.type !== AST_NODE_TYPES.ReturnStatement) {
              reportReturnRequired(context, topNode);
            }
          }
        }
      },
    };
  },
});
