import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  FunctionExpression,
  JestFunctionCallExpression,
  StringLiteral,
  TestCaseName,
  createRule,
  getNodeName,
  isFunction,
  isStringNode,
  isTestCase,
} from './tsUtils';

function isOnlyTestTitle(node: TSESTree.CallExpression) {
  return node.arguments.length === 1;
}

function isFunctionBodyEmpty(node: FunctionExpression) {
  /* istanbul ignore next https://github.com/typescript-eslint/typescript-eslint/issues/734 */
  if (!node.body) {
    throw new Error(
      `Unexpected null while performing prefer-todo - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
    );
  }

  return (
    node.body.type === AST_NODE_TYPES.BlockStatement &&
    node.body.body &&
    !node.body.body.length
  );
}

function isTestBodyEmpty(node: TSESTree.CallExpression) {
  const [, fn] = node.arguments;
  return fn && isFunction(fn) && isFunctionBodyEmpty(fn);
}

function addTodo(
  node: JestFunctionCallExpression<TestCaseName>,
  fixer: TSESLint.RuleFixer,
) {
  const testName = getNodeName(node.callee)
    .split('.')
    .shift();
  return fixer.replaceText(node.callee, `${testName}.todo`);
}

interface CallExpressionWithStringArgument extends TSESTree.CallExpression {
  arguments: [StringLiteral | TSESTree.TemplateLiteral];
}

function isFirstArgString(
  node: TSESTree.CallExpression,
): node is CallExpressionWithStringArgument {
  return node.arguments[0] && isStringNode(node.arguments[0]);
}

const isTargetedTestCase = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<TestCaseName> =>
  isTestCase(node) &&
  (['it', 'test', 'it.skip', 'test.skip'] as Array<string | null>).includes(
    getNodeName(node.callee),
  );

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `test.todo`',
      recommended: false,
    },
    messages: {
      todoOverEmpty: 'Prefer todo test case over empty test case',
      todoOverUnimplemented:
        'Prefer todo test case over unimplemented test case',
    },
    fixable: 'code',
    schema: [],
    type: 'layout',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isTargetedTestCase(node) || !isFirstArgString(node)) {
          return;
        }

        if (isTestBodyEmpty(node)) {
          context.report({
            messageId: 'todoOverEmpty',
            node,
            fix: fixer => [
              fixer.removeRange([
                node.arguments[0].range[1],
                node.arguments[1].range[1],
              ]),
              addTodo(node, fixer),
            ],
          });
        }

        if (isOnlyTestTitle(node)) {
          context.report({
            messageId: 'todoOverUnimplemented',
            node,
            fix: fixer => [addTodo(node, fixer)],
          });
        }
      },
    };
  },
});
