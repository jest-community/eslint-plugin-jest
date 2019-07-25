import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, isDescribe, isExpectCall, isFunction } from './tsUtils';

const getBlockType = (
  stmt: TSESTree.BlockStatement,
): 'function' | 'describe' | 'callExpr' | false => {
  const func = stmt.parent;

  if (!func) {
    return false;
  }
  // functionDeclaration: function func() {}
  if (func.type === AST_NODE_TYPES.FunctionDeclaration) {
    return 'function';
  }
  if (isFunction(func) && func.parent) {
    const expr = func.parent;
    // arrowfunction or function expr
    if (expr.type === AST_NODE_TYPES.VariableDeclarator) {
      return 'function';
    }
    // if it's not a variable, it will be callExpr, we only care about describe
    if (expr.type === AST_NODE_TYPES.CallExpression && isDescribe(expr)) {
      return 'describe';
    }
    return 'callExpr';
  }
  return false;
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prevents expects that are outside of an it or test block.',
      recommended: false,
    },
    messages: {
      unexpectedExpect: 'Expect must be inside of a test block.',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const callStack: string[] = [];

    return {
      CallExpression(node) {
        if (isExpectCall(node)) {
          const parent = callStack[callStack.length - 1];
          if (!parent || parent === 'describe') {
            context.report({ node, messageId: 'unexpectedExpect' });
          }
        }
      },
      BlockStatement(stmt) {
        const blockType = getBlockType(stmt);
        if (blockType) {
          callStack.push(blockType);
        }
      },
      'BlockStatement:exit'(stmt: TSESTree.BlockStatement) {
        const blockType = getBlockType(stmt);
        if (blockType && blockType === callStack[callStack.length - 1]) {
          callStack.pop();
        }
      },
    };
  },
});
