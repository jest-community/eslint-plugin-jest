import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  type JestFnType,
  createRule,
  getAccessorValue,
  getSourceCode,
  isIdentifier,
  isStringNode,
  isSupportedAccessor,
  parseJestFnCall,
} from './utils';

const createFixerImports = (
  isModule: boolean,
  functionsToImport: Set<string>,
) => {
  const allImportsFormatted = Array.from(functionsToImport).sort().join(', ');

  return isModule
    ? `import { ${allImportsFormatted} } from '@jest/globals';`
    : `const { ${allImportsFormatted} } = require('@jest/globals');`;
};

const allJestFnTypes: JestFnType[] = [
  'hook',
  'describe',
  'test',
  'expect',
  'jest',
  'unknown',
];

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Prefer importing Jest globals',
    },
    messages: {
      preferImportingJestGlobal: `Import the following Jest functions from '@jest/globals': {{ jestFunctions }}`,
    },
    fixable: 'code',
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          types: {
            type: 'array',
            items: {
              type: 'string',
              enum: allJestFnTypes,
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ types: allJestFnTypes }],
  create(context) {
    const { types = allJestFnTypes } = context.options[0] || {};
    const importedFunctionsWithSource: Record<string, string> = {};
    const functionsToImport = new Set<string>();
    let reportingNode: TSESTree.Node;

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        node.specifiers.forEach(specifier => {
          if (specifier.type === 'ImportSpecifier') {
            importedFunctionsWithSource[specifier.local.name] =
              node.source.value;
          }
        });
      },
      CallExpression(node: TSESTree.CallExpression) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (
          jestFnCall.head.type !== 'import' &&
          types.includes(jestFnCall.type)
        ) {
          functionsToImport.add(jestFnCall.name);
          reportingNode ||= jestFnCall.head.node;
        }
      },
      'Program:exit'() {
        // this means we found at least one function to import
        if (!reportingNode) {
          return;
        }

        const isModule = context.parserOptions.sourceType === 'module';

        context.report({
          node: reportingNode,
          messageId: 'preferImportingJestGlobal',
          data: { jestFunctions: Array.from(functionsToImport).join(', ') },
          fix(fixer) {
            const sourceCode = getSourceCode(context);
            const [firstNode] = sourceCode.ast.body;

            // check if "use strict" directive exists
            if (
              firstNode.type === AST_NODE_TYPES.ExpressionStatement &&
              isStringNode(firstNode.expression, 'use strict')
            ) {
              return fixer.insertTextAfter(
                firstNode,
                `\n${createFixerImports(isModule, functionsToImport)}`,
              );
            }

            const importNode = sourceCode.ast.body.find(
              node =>
                node.type === AST_NODE_TYPES.ImportDeclaration &&
                node.source.value === '@jest/globals',
            );

            if (importNode?.type === AST_NODE_TYPES.ImportDeclaration) {
              for (const specifier of importNode.specifiers) {
                if (
                  specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                  specifier.imported?.name
                ) {
                  functionsToImport.add(specifier.imported.name);
                }

                if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
                  functionsToImport.add(specifier.local.name);
                }
              }

              return fixer.replaceText(
                importNode,
                createFixerImports(isModule, functionsToImport),
              );
            }

            const requireNode = sourceCode.ast.body.find(
              node =>
                node.type === AST_NODE_TYPES.VariableDeclaration &&
                node.declarations.some(
                  declaration =>
                    declaration.init?.type === AST_NODE_TYPES.CallExpression &&
                    isIdentifier(declaration.init.callee, 'require') &&
                    isStringNode(
                      declaration.init.arguments[0],
                      '@jest/globals',
                    ) &&
                    (declaration.id.type === AST_NODE_TYPES.Identifier ||
                      declaration.id.type === AST_NODE_TYPES.ObjectPattern),
                ),
            );

            if (requireNode?.type !== AST_NODE_TYPES.VariableDeclaration) {
              return fixer.insertTextBefore(
                reportingNode,
                `${createFixerImports(isModule, functionsToImport)}\n`,
              );
            }

            if (
              requireNode.declarations[0]?.id.type ===
              AST_NODE_TYPES.ObjectPattern
            ) {
              for (const property of requireNode.declarations[0].id
                .properties) {
                if (
                  property.type === AST_NODE_TYPES.Property &&
                  isSupportedAccessor(property.key)
                ) {
                  functionsToImport.add(getAccessorValue(property.key));
                }
              }
            }

            return fixer.replaceText(
              requireNode,
              `${createFixerImports(isModule, functionsToImport)}`,
            );
          },
        });
      },
    };
  },
});
