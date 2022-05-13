import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  JestFunctionCallExpression,
  TestCaseName,
  createRule,
  getNodeName,
  hasOnlyOneArgument,
  isFunction,
  isStringNode,
  isTestCaseCall,
} from './utils';

function isEmptyFunction(node: TSESTree.CallExpressionArgument) {
  if (!isFunction(node)) {
    return false;
  }

  return (
    node.body.type === AST_NODE_TYPES.BlockStatement && !node.body.body.length
  );
}

function createTodoFixer(
  node: JestFunctionCallExpression<TestCaseName>,
  fixer: TSESLint.RuleFixer,
) {
  const testName = getNodeName(node).split('.').shift();

  return fixer.replaceText(node.callee, `${testName}.todo`);
}

const isTargetedTestCase = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): node is JestFunctionCallExpression<TestCaseName> =>
  isTestCaseCall(node, scope) &&
  [TestCaseName.it, TestCaseName.test, 'it.skip', 'test.skip'].includes(
    getNodeName(node),
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
      emptyTest: 'Prefer todo test case over empty test case',
      unimplementedTest: 'Prefer todo test case over unimplemented test case',
    },
    fixable: 'code',
    schema: [],
    type: 'layout',
  },
  defaultOptions: [],
  create(context) {
    const scope = context.getScope();

    return {
      CallExpression(node) {
        const [title, callback] = node.arguments;

        if (
          !title ||
          !isTargetedTestCase(node, scope) ||
          !isStringNode(title)
        ) {
          return;
        }

        if (callback && isEmptyFunction(callback)) {
          context.report({
            messageId: 'emptyTest',
            node,
            fix: fixer => [
              fixer.removeRange([title.range[1], callback.range[1]]),
              createTodoFixer(node, fixer),
            ],
          });
        }

        if (hasOnlyOneArgument(node)) {
          context.report({
            messageId: 'unimplementedTest',
            node,
            fix: fixer => [createTodoFixer(node, fixer)],
          });
        }
      },
    };
  },
});
