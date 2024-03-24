import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  type ParsedJestFnCall,
  createRule,
  getAccessorValue,
  hasOnlyOneArgument,
  isFunction,
  isStringNode,
  parseJestFnCall,
  replaceAccessorFixer,
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
  jestFnCall: ParsedJestFnCall,
  fixer: TSESLint.RuleFixer,
) {
  if (jestFnCall.members.length) {
    return replaceAccessorFixer(fixer, jestFnCall.members[0], 'todo');
  }

  return fixer.replaceText(
    jestFnCall.head.node,
    `${jestFnCall.head.local}.todo`,
  );
}

const isTargetedTestCase = (jestFnCall: ParsedJestFnCall): boolean => {
  if (jestFnCall.members.some(s => getAccessorValue(s) !== 'skip')) {
    return false;
  }

  // todo: we should support this too (needs custom fixer)
  if (jestFnCall.name.startsWith('x')) {
    return false;
  }

  return !jestFnCall.name.startsWith('f');
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest using `test.todo`',
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
    return {
      CallExpression(node) {
        const [title, callback] = node.arguments;

        const jestFnCall = parseJestFnCall(node, context);

        if (
          !title ||
          jestFnCall?.type !== 'test' ||
          !isTargetedTestCase(jestFnCall) ||
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
              createTodoFixer(jestFnCall, fixer),
            ],
          });
        }

        if (hasOnlyOneArgument(node)) {
          context.report({
            messageId: 'unimplementedTest',
            node,
            fix: fixer => createTodoFixer(jestFnCall, fixer),
          });
        }
      },
    };
  },
});
