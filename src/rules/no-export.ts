import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { createRule, isTypeOfJestFnCall, resolveScope } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow using `exports` in files containing tests',
    },
    messages: {
      unexpectedExport: `Do not export from a test file`,
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const exportNodes: Array<
      | TSESTree.ExportNamedDeclaration
      | TSESTree.ExportDefaultDeclaration
      | TSESTree.TSExportAssignment
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
        if (isTypeOfJestFnCall(node, context, ['describe', 'test'])) {
          hasTestCase = true;
        }
      },
      'ExportNamedDeclaration, ExportDefaultDeclaration, TSExportAssignment'(
        node:
          | TSESTree.ExportNamedDeclaration
          | TSESTree.ExportDefaultDeclaration
          | TSESTree.TSExportAssignment,
      ) {
        exportNodes.push(node);
      },
      'AssignmentExpression > MemberExpression'(
        node: TSESTree.MemberExpression,
      ) {
        let { object, property } = node;

        while (object.type === AST_NODE_TYPES.MemberExpression) {
          ({ object, property } = object);
        }

        if (object.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (
          (object.name !== 'module' ||
            resolveScope(context.sourceCode.getScope(object), 'module') !==
              null) &&
          (object.name !== 'exports' ||
            resolveScope(context.sourceCode.getScope(object), 'exports') !==
              null)
        ) {
          return;
        }

        if (
          object.name === 'exports' ||
          (property.type === AST_NODE_TYPES.Identifier &&
            /^exports?$/u.test(property.name))
        ) {
          exportNodes.push(node);
        }
      },
    };
  },
});
