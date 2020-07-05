import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, isTestCase } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prevent exporting from test files',
      recommended: 'error',
    },
    messages: {
      unexpectedExport: `Do not export from a test file.`,
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const exportNodes: Array<
      | TSESTree.ExportNamedDeclaration
      | TSESTree.ExportDefaultDeclaration
      | TSESTree.MemberExpression
    > = [];
    let hasTestCase = false;

    return {
      'Program:exit'() {
        if (hasTestCase && exportNodes.length > 0) {
          for (const node of exportNodes) {
            context.report({ node, messageId: 'unexpectedExport' });
          }
        }
      },

      CallExpression(node) {
        if (isTestCase(node)) {
          hasTestCase = true;
        }
      },
      'ExportNamedDeclaration, ExportDefaultDeclaration'(
        node:
          | TSESTree.ExportNamedDeclaration
          | TSESTree.ExportDefaultDeclaration,
      ) {
        exportNodes.push(node);
      },
      'AssignmentExpression > MemberExpression'(
        node: TSESTree.MemberExpression,
      ) {
        let { object, property } = node;

        if (object.type === AST_NODE_TYPES.MemberExpression) {
          ({ object, property } = object);
        }

        if (
          'name' in object &&
          object.name === 'module' &&
          property.type === AST_NODE_TYPES.Identifier &&
          /^exports?$/u.test(property.name)
        ) {
          exportNodes.push(node);
        }
      },
    };
  },
});
