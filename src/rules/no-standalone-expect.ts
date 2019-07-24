import { createRule, isDescribe, isExpectCall, isFunction } from './tsUtils';
import { TSESTree } from '@typescript-eslint/experimental-utils';

const getBlockType = (stmt: TSESTree.BlockStatement) => {
  const func = stmt.parent;
  // functionDeclaration: function func() {}
  if (func && func.type === 'FunctionDeclaration') {
    return 'function';
  } else if (func && isFunction(func) && func.parent) {
    const expr = func.parent;
    // arrowfunction or function expr
    if (expr.type === 'VariableDeclarator') {
      return 'function';
      // if it's not a variable, it will be callExpr, we only care about describe
    } else if (isDescribe(expr as TSESTree.CallExpression)) {
      return 'describe';
    } else {
      return 'callExpr';
    }
  } else {
    return false;
  }
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
      unexpectedExpect: `Expect must be inside of a test block.`,
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const callStack: Array<String> = [];

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
      'BlockStatement:exit'(stmt) {
        const blockType = getBlockType(stmt);
        if (blockType && blockType === callStack[callStack.length - 1]) {
          callStack.pop();
        }
      },
    };
  },
});
