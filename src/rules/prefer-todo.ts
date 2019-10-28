import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  FunctionExpression,
  JestFunctionCallExpression,
  TestCaseName,
  createRule,
  getNodeName,
  hasOnlyOneArgument,
  isFunction,
  isStringNode,
  isTestCase,
} from './utils';

function isFunctionBodyEmpty(node: FunctionExpression) {
  /* istanbul ignore if https://github.com/typescript-eslint/typescript-eslint/issues/734 */
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

const isTargetedTestCase = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<TestCaseName> =>
  isTestCase(node) &&
  [TestCaseName.it, TestCaseName.test, 'it.skip', 'test.skip'].includes(
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
        const [firstArg, secondArg] = node.arguments;

        if (!firstArg || !isTargetedTestCase(node) || !isStringNode(firstArg)) {
          return;
        }

        if (isTestBodyEmpty(node)) {
          context.report({
            messageId: 'todoOverEmpty',
            node,
            fix: fixer => [
              fixer.removeRange([firstArg.range[1], secondArg.range[1]]),
              addTodo(node, fixer),
            ],
          });
        }

        if (hasOnlyOneArgument(node)) {
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
