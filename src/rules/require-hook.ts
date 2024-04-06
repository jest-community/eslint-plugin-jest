import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createRule,
  getNodeName,
  isFunction,
  isIdentifier,
  isTypeOfJestFnCall,
  parseJestFnCall,
} from './utils';

const isJestFnCall = (
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
): boolean => {
  if (parseJestFnCall(node, context)) {
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
  context: TSESLint.RuleContext<string, unknown[]>,
  allowedFunctionCalls: readonly string[] = [],
): boolean => {
  switch (node.type) {
    case AST_NODE_TYPES.ExpressionStatement:
      return shouldBeInHook(node.expression, context, allowedFunctionCalls);
    case AST_NODE_TYPES.CallExpression:
      return !(
        isJestFnCall(node, context) ||
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
      description: 'Require setup and teardown code to be within a hook',
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
        if (shouldBeInHook(statement, context, allowedFunctionCalls)) {
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
        if (
          !isTypeOfJestFnCall(node, context, ['describe']) ||
          node.arguments.length < 2
        ) {
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
