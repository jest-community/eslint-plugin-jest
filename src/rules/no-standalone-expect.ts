import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  DescribeAlias,
  createRule,
  getAccessorValue,
  getNodeName,
  isFunction,
  isTypeOfJestFnCall,
  parseJestFnCall,
} from './utils';

const getBlockType = (
  statement: TSESTree.BlockStatement,
  context: TSESLint.RuleContext<string, unknown[]>,
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
    if (
      expr.type === AST_NODE_TYPES.CallExpression &&
      isTypeOfJestFnCall(expr, context, ['describe'])
    ) {
      return 'describe';
    }
  }

  return null;
};

type BlockType = 'test' | 'function' | 'describe' | 'arrow' | 'template';

export default createRule<
  [{ additionalTestBlockFunctions?: string[] }],
  'unexpectedExpect'
>({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow using `expect` outside of `it` or `test` blocks',
    },
    messages: {
      unexpectedExpect: 'Expect must be inside of a test block',
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

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type === 'expect') {
          if (
            jestFnCall.head.node.parent?.type ===
              AST_NODE_TYPES.MemberExpression &&
            jestFnCall.members.length === 1 &&
            !['assertions', 'hasAssertions'].includes(
              getAccessorValue(jestFnCall.members[0]),
            )
          ) {
            return;
          }

          const parent = callStack[callStack.length - 1];

          if (!parent || parent === DescribeAlias.describe) {
            context.report({ node, messageId: 'unexpectedExpect' });
          }

          return;
        }

        if (jestFnCall?.type === 'test' || isCustomTestBlockFunction(node)) {
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
            (isTypeOfJestFnCall(node, context, ['test']) ||
              isCustomTestBlockFunction(node)) &&
            node.callee.type !== AST_NODE_TYPES.MemberExpression) ||
          (top === 'template' &&
            node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression)
        ) {
          callStack.pop();
        }
      },

      BlockStatement(statement) {
        const blockType = getBlockType(statement, context);

        if (blockType) {
          callStack.push(blockType);
        }
      },
      'BlockStatement:exit'(statement: TSESTree.BlockStatement) {
        if (
          callStack[callStack.length - 1] === getBlockType(statement, context)
        ) {
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
