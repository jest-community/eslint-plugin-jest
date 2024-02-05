import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { Literal } from 'estree';
import { type ParsedJestFnCall, createRule, parseJestFnCall } from './utils';

const createFixerImports = (isModule: boolean, functionsToImport: string[]) => {
  const allImportsFormatted = functionsToImport.join(', ');

  return isModule
    ? `import { ${allImportsFormatted} } from '@jest/globals';`
    : `const { ${allImportsFormatted} } = require('@jest/globals');`;
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prefer importing Jest globals',
      recommended: false,
    },
    messages: {
      preferImportingJestGlobal: `Import the following Jest functions from '@jest/globals': {{ jestFunctions }}`,
    },
    fixable: 'code',
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importedJestFunctions: string[] = [];
    const usedJestFunctions: ParsedJestFnCall[] = [];

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.head.type === 'import') {
          importedJestFunctions.push(jestFnCall.name);
        }

        usedJestFunctions.push(jestFnCall);
      },
      'Program:exit'() {
        const jestFunctionsToReport = usedJestFunctions.filter(
          jestFunction => !importedJestFunctions.includes(jestFunction.name),
        );

        if (!jestFunctionsToReport.length) {
          return;
        }
        const jestFunctionsToImport = jestFunctionsToReport.map(
          jestFunction => jestFunction.name,
        );
        const reportingNode = jestFunctionsToReport[0].head.node;

        const jestFunctionsToImportFormatted = jestFunctionsToImport.join(', ');

        const isModule = context.parserOptions.sourceType === 'module';

        context.report({
          node: reportingNode,
          messageId: 'preferImportingJestGlobal',
          data: { jestFunctions: jestFunctionsToImportFormatted },
          fix(fixer) {
            const sourceCode = context.getSourceCode();
            const [firstNode] = sourceCode.ast.body;

            const useStrictDirectiveExists =
              firstNode.type === AST_NODE_TYPES.ExpressionStatement &&
              (firstNode.expression as Literal).value === 'use strict';

            if (useStrictDirectiveExists) {
              return fixer.insertTextAfter(
                firstNode,
                `\n${createFixerImports(isModule, jestFunctionsToImport)}`,
              );
            }

            const importNode = sourceCode.ast.body.find(
              node =>
                node.type === AST_NODE_TYPES.ImportDeclaration &&
                node.source.value === '@jest/globals',
            );

            if (
              importNode &&
              importNode.type === AST_NODE_TYPES.ImportDeclaration
            ) {
              const existingImports = importNode.specifiers.reduce(
                (imports, specifier) => {
                  /* istanbul ignore else */
                  if (
                    specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                    specifier.imported?.name
                  ) {
                    imports.push(specifier.imported.name);
                  }

                  return imports;
                },
                [] as string[],
              );

              const allImports = [
                ...new Set([...existingImports, ...jestFunctionsToImport]),
              ];

              return fixer.replaceText(
                importNode,
                createFixerImports(isModule, allImports),
              );
            }

            const requireNode = sourceCode.ast.body.find(
              node =>
                node.type === AST_NODE_TYPES.VariableDeclaration &&
                node.declarations.some(
                  declaration =>
                    declaration.init &&
                    (declaration.init as any).callee &&
                    (declaration.init as any).callee.name === 'require' &&
                    (declaration.init as any).arguments?.[0]?.type ===
                      'Literal' &&
                    (declaration.init as any).arguments?.[0]?.value ===
                      '@jest/globals',
                ),
            );

            if (
              requireNode &&
              requireNode.type === AST_NODE_TYPES.VariableDeclaration
            ) {
              const existingImports =
                requireNode.declarations[0]?.id.type ===
                AST_NODE_TYPES.ObjectPattern
                  ? requireNode.declarations[0]?.id.properties.map(property => {
                      if (
                        property.type === AST_NODE_TYPES.Property &&
                        property.key.type === AST_NODE_TYPES.Identifier
                      ) {
                        return property.key.name;
                      }
                      /* istanbul ignore else */
                      if (
                        property.type === AST_NODE_TYPES.Property &&
                        property.key.type === AST_NODE_TYPES.Literal
                      ) {
                        return property.key.value;
                      }

                      // istanbul ignore next
                      return null;
                    })
                  : [];

              const allImports = [
                ...new Set([
                  ...existingImports.filter(
                    (imp): imp is string => imp !== null,
                  ),
                  ...jestFunctionsToImport,
                ]),
              ];

              return fixer.replaceText(
                requireNode,
                `${createFixerImports(isModule, allImports)}`,
              );
            }

            return fixer.insertTextBefore(
              reportingNode,
              `${createFixerImports(isModule, jestFunctionsToImport)}\n`,
            );
          },
        });
      },
    };
  },
});
