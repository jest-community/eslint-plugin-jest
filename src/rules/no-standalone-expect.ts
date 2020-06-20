import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  TestCaseName,
  createRule,
  isDescribe,
  isExpectCall,
  isFunction,
  isTestCase,
} from './utils';

const getBlockType = (
  stmt: TSESTree.BlockStatement,
): 'function' | DescribeAlias.describe | null => {
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
      return DescribeAlias.describe;
    }
  }

  return null;
};

const isEach = (node: TSESTree.CallExpression): boolean =>
  node.callee.type === AST_NODE_TYPES.CallExpression &&
  node.callee.callee.type === AST_NODE_TYPES.MemberExpression &&
  node.callee.callee.property.type === AST_NODE_TYPES.Identifier &&
  node.callee.callee.property.name === 'each' &&
  node.callee.callee.object.type === AST_NODE_TYPES.Identifier &&
  TestCaseName.hasOwnProperty(node.callee.callee.object.name);

type callStackEntry =
  | TestCaseName.test
  | 'function'
  | DescribeAlias.describe
  | 'arrowFunc'
  | 'template';

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
    const callStack: callStackEntry[] = [];

    return {
      CallExpression(node) {
        if (isExpectCall(node)) {
          const parent = callStack[callStack.length - 1];

          if (!parent || parent === DescribeAlias.describe) {
            context.report({ node, messageId: 'unexpectedExpect' });
          }

          return;
        }
        if (isTestCase(node)) {
          callStack.push(TestCaseName.test);
        }
        if (node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          callStack.push('template');
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        const top = callStack[callStack.length - 1];

        if (
          (((isTestCase(node) &&
            node.callee.type !== AST_NODE_TYPES.MemberExpression) ||
            isEach(node)) &&
            top === TestCaseName.test) ||
          (node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression &&
            top === 'template')
        ) {
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
      'ArrowFunctionExpression:exit'() {
        if (callStack[callStack.length - 1] === 'arrowFunc') {
          callStack.pop();
        }
      },
    };
  },
});
