import { TSESTree } from '@typescript-eslint/utils';
import { createRule } from './utils';

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing Jest',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      unexpectedImport: `Do not import "jest". Jest is automatically in scope within every test file.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'ImportDeclaration[source.value="jest"]'(
        node: TSESTree.ImportDeclaration,
      ) {
        context.report({ node, messageId: 'unexpectedImport' });
      },
      'CallExpression[callee.name="require"][arguments.0.value="jest"]'(
        node: TSESTree.CallExpression,
      ) {
        context.report({
          loc: node.arguments[0].loc,
          messageId: 'unexpectedImport',
          node,
        });
      },
    };
  },
});
