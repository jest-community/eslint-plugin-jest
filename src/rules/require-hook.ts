import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getNodeName,
  isDescribeCall,
  isFunction,
  isHook,
  isIdentifier,
  isTestCaseCall,
} from './utils';

const isJestFnCall = (node: TSESTree.CallExpression): boolean => {
  if (isDescribeCall(node) || isTestCaseCall(node) || isHook(node)) {
    return true;
  }

  return !!getNodeName(node)?.startsWith('jest.');
};

const isNullOrUndefined = (node: TSESTree.Expression): boolean => {
  return (
    (node.type === AST_NODE_TYPES.Literal && node.value === null) ||
    isIdentifier(node, 'undefined')
  );
};

const shouldBeInHook = (
  node: TSESTree.Node,
  allowedFunctionCalls: readonly string[] = [],
): boolean => {
  switch (node.type) {
    case AST_NODE_TYPES.ExpressionStatement:
      return shouldBeInHook(node.expression, allowedFunctionCalls);
    case AST_NODE_TYPES.CallExpression:
      return !(
        isJestFnCall(node) ||
        allowedFunctionCalls.includes(getNodeName(node) as string)
      );
    case AST_NODE_TYPES.VariableDeclaration: {
      if (node.kind === 'const') {
        return false;
      }

      return node.declarations.some(
        ({ init }) => init !== null && !isNullOrUndefined(init),
      );
    }

    default:
      return false;
  }
};

export default createRule<
  [{ allowedFunctionCalls?: readonly string[] }],
  'useHook'
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Require setup and teardown code to be within a hook',
      recommended: false,
    },
    messages: {
      useHook: 'This should be done within a hook',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          allowedFunctionCalls: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowedFunctionCalls: [],
    },
  ],
  create(context) {
    const { allowedFunctionCalls } = context.options[0] ?? {};

    const checkBlockBody = (body: TSESTree.BlockStatement['body']) => {
      for (const statement of body) {
        if (shouldBeInHook(statement, allowedFunctionCalls)) {
          context.report({
            node: statement,
            messageId: 'useHook',
          });
        }
      }
    };

    return {
      Program(program) {
        checkBlockBody(program.body);
      },
      CallExpression(node) {
        if (!isDescribeCall(node) || node.arguments.length < 2) {
          return;
        }

        const [, testFn] = node.arguments;

        if (
          !isFunction(testFn) ||
          testFn.body.type !== AST_NODE_TYPES.BlockStatement
        ) {
          return;
        }

        checkBlockBody(testFn.body.body);
      },
    };
  },
});
