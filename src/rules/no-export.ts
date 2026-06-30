import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { createRule, isTypeOfJestFnCall, resolveScope } from './utils';

const isGlobalIdentifier = (
  node: TSESTree.Identifier,
  context: TSESLint.RuleContext<string, unknown[]>,
  name: string,
): boolean =>
  node.name === name &&
  resolveScope(context.sourceCode.getScope(node), name) === null;

const getMemberExpressionRootIdentifier = (
  member: TSESTree.MemberExpression,
): TSESTree.Identifier | null => {
  let current = member.object;

  while (current.type === AST_NODE_TYPES.MemberExpression) {
    current = current.object;
  }

  return current.type === AST_NODE_TYPES.Identifier ? current : null;
};

const isCommonJsExportAssignment = (
  node: TSESTree.AssignmentExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
): boolean => {
  const { left } = node;

  if (
    left.type === AST_NODE_TYPES.Identifier &&
    isGlobalIdentifier(left, context, 'exports')
  ) {
    return true;
  }

  if (left.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const root = getMemberExpressionRootIdentifier(left);

  return (
    root !== null &&
    (isGlobalIdentifier(root, context, 'module') ||
      isGlobalIdentifier(root, context, 'exports'))
  );
};

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
      | TSESTree.AssignmentExpression['left']
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
      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        if (isCommonJsExportAssignment(node, context)) {
          exportNodes.push(node.left);
        }
      },
    };
  },
});
