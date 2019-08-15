import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      description:
        "The `jest` object is automatically in scope within every test file. The methods in the `jest` object help create mocks and let you control Jest's overall behavior. It is therefore completely unnecessary to import in `jest`, as Jest doesn't export anything in the first place.",
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      unexpectedImport: `Jest is automatically in scope. Do not import "jest", as Jest doesn't export anything.`,
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
