import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createRule,
  isStringNode,
  isSupportedAccessor,
  isTypeOfJestFnCall,
  resolveScope,
} from './utils';

const isGlobalIdentifier = (
  node: TSESTree.Identifier,
  context: TSESLint.RuleContext<string, unknown[]>,
  name: string,
): boolean =>
  node.name === name &&
  resolveScope(context.sourceCode.getScope(node), name) === null;

const isModuleExportsMember = (
  member: TSESTree.MemberExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
): boolean => {
  const { object, property, computed } = member;

  if (
    object.type !== AST_NODE_TYPES.Identifier ||
    !isGlobalIdentifier(object, context, 'module')
  ) {
    return false;
  }

  if (!computed) {
    return isSupportedAccessor(property, 'exports');
  }

  if (isStringNode(property, 'exports')) {
    return true;
  }

  return (
    property.type === AST_NODE_TYPES.Identifier &&
    isGlobalIdentifier(property, context, 'exports')
  );
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

  let current: TSESTree.Expression = left;

  while (current.type === AST_NODE_TYPES.MemberExpression) {
    if (isModuleExportsMember(current, context)) {
      return true;
    }

    if (
      current.object.type === AST_NODE_TYPES.Identifier &&
      isGlobalIdentifier(current.object, context, 'exports')
    ) {
      return true;
    }

    current = current.object;
  }

  return false;
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
        if (isTypeOfJestFnCall(node, context, ['test'])) {
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
