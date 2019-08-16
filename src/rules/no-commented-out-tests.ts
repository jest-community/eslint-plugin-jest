import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

function hasTests(node: TSESTree.Comment) {
  return /^\s*(x|f)?(test|it|describe)(\.\w+|\[['"]\w+['"]\])?\s*\(/m.test(
    node.value,
  );
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        "This rule raises a warning about commented out tests. It's similar to no-disabled-tests rule.",
      recommended: false,
    },
    messages: {
      commentedTests: 'Some tests seem to be commented',
    },
    schema: [],
    type: 'suggestion',
  } as const,
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function checkNode(node: TSESTree.Comment) {
      if (!hasTests(node)) {
        return;
      }

      context.report({ messageId: 'commentedTests', node });
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach(checkNode);
      },
    };
  },
});
