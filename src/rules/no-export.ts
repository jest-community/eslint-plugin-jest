import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { createRule, isTypeOfJestFnCall, resolveScope } from './utils';

const isGlobalIdentifier = (
  node: TSESTree.Identifier,
  name: string,
  context: TSESLint.RuleContext<string, unknown[]>,
): boolean =>
  node.name === name &&
  resolveScope(context.sourceCode.getScope(node), name) === null;

type MemberExpressionWithIdentifierObject = TSESTree.MemberExpression & {
  object: TSESTree.Identifier;
};

const getModuleMemberExpressionRoot = (
  member: TSESTree.MemberExpression,
): MemberExpressionWithIdentifierObject | null => {
  let current = member;

  while (current.object.type === AST_NODE_TYPES.MemberExpression) {
    current = current.object;
  }

  return current.object.type === AST_NODE_TYPES.Identifier
    ? (current as MemberExpressionWithIdentifierObject)
    : null;
};

const isCommonJsExportAssignment = (
  node: TSESTree.AssignmentExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
): boolean => {
  const { left } = node;

  if (left.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const root = getModuleMemberExpressionRoot(left);

  return (
    root !== null &&
    isGlobalIdentifier(root.object, 'module', context) &&
    ((!root.computed &&
      root.property.type === AST_NODE_TYPES.Identifier &&
      /^exports?$/u.test(root.property.name)) ||
      (root.property.type === AST_NODE_TYPES.Literal &&
        root.property.value === 'exports'))
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
