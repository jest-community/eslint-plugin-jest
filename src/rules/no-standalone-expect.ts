import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  TestCaseName,
  createRule,
  getNodeName,
  isDescribeCall,
  isExpectCall,
  isFunction,
  isTestCaseCall,
} from './utils';

const getBlockType = (
  statement: TSESTree.BlockStatement,
): 'function' | 'describe' | null => {
  const func = statement.parent;

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

    // arrow function or function expr
    if (expr.type === AST_NODE_TYPES.VariableDeclarator) {
      return 'function';
    }

    // if it's not a variable, it will be callExpr, we only care about describe
    if (expr.type === AST_NODE_TYPES.CallExpression && isDescribeCall(expr)) {
      return 'describe';
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

type BlockType = 'test' | 'function' | 'describe' | 'arrow' | 'template';

export default createRule<
  [{ additionalTestBlockFunctions?: string[] }],
  'unexpectedExpect'
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow using `expect` outside of `it` or `test` blocks',
      recommended: 'error',
    },
    messages: {
      unexpectedExpect: 'Expect must be inside of a test block.',
    },
    type: 'suggestion',
    schema: [
      {
        properties: {
          additionalTestBlockFunctions: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ additionalTestBlockFunctions: [] }],
  create(context, [{ additionalTestBlockFunctions = [] }]) {
    const callStack: BlockType[] = [];

    const isCustomTestBlockFunction = (
      node: TSESTree.CallExpression,
    ): boolean =>
      additionalTestBlockFunctions.includes(getNodeName(node) || '');

    const isTestBlock = (node: TSESTree.CallExpression): boolean =>
      isTestCaseCall(node) || isCustomTestBlockFunction(node);

    return {
      CallExpression(node) {
        if (isExpectCall(node)) {
          const parent = callStack[callStack.length - 1];

          if (!parent || parent === DescribeAlias.describe) {
            context.report({ node, messageId: 'unexpectedExpect' });
          }

          return;
        }

        if (isTestBlock(node)) {
          callStack.push('test');
        }

        if (node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          callStack.push('template');
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        const top = callStack[callStack.length - 1];

        if (
          (top === 'test' &&
            (isEach(node) ||
              (isTestBlock(node) &&
                node.callee.type !== AST_NODE_TYPES.MemberExpression))) ||
          (top === 'template' &&
            node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression)
        ) {
          callStack.pop();
        }
      },

      BlockStatement(statement) {
        const blockType = getBlockType(statement);

        if (blockType) {
          callStack.push(blockType);
        }
      },
      'BlockStatement:exit'(statement: TSESTree.BlockStatement) {
        if (callStack[callStack.length - 1] === getBlockType(statement)) {
          callStack.pop();
        }
      },

      ArrowFunctionExpression(node) {
        if (node.parent?.type !== AST_NODE_TYPES.CallExpression) {
          callStack.push('arrow');
        }
      },
      'ArrowFunctionExpression:exit'() {
        if (callStack[callStack.length - 1] === 'arrow') {
          callStack.pop();
        }
      },
    };
  },
});
