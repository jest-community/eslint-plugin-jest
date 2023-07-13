import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from './utils';

function hasTests(node: TSESTree.Comment) {
  return /^\s*[xf]?(test|it|describe)(\.\w+|\[['"]\w+['"]\])?\s*\(/mu.test(
    node.value,
  );
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow commented out tests',
    },
    messages: {
      commentedTests: 'Some tests seem to be commented',
    },
    schema: [],
    type: 'suggestion',
  },
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
