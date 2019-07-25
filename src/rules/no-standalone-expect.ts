import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  isDescribe,
  isExpectCall,
  isFunction,
  isTestCase,
} from './tsUtils';

const getBlockType = (
  stmt: TSESTree.BlockStatement,
): 'function' | 'describe' | 'callExpr' | false => {
  const func = stmt.parent;

  /* istanbul ignore if */

  if (!func) {
    throw new Error(
      `Unexpected BlockStatement. No parent defined. - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
    );
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
    return false;
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
        if (isTestCase(node)) {
          callStack.push('test');
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCase(node) && callStack[callStack.length - 1] === 'test') {
          callStack.pop();
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
      ArrowFunctionExpression(node) {
        if (node.parent && node.parent.type !== AST_NODE_TYPES.CallExpression) {
          callStack.push('arrowFunc');
        }
      },
      'ArrowFunctionExpression:exit'(node) {
        if (callStack[callStack.length - 1] === 'arrowFunc') {
          callStack.pop();
        }
      },
    };
  },
});
