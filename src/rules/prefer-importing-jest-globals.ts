import type { Literal } from 'estree';
import { createRule, parseJestFnCall } from './utils';

const createFixerImports = (
  usesImport: boolean,
  functionsToImport: string[],
) => {
  const allImportsFormatted = functionsToImport.filter(Boolean).join(', ');

  return usesImport
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
    const usedJestFunctions = new Set<string>();

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.head.type === 'import') {
          importedJestFunctions.push(jestFnCall.name);
        }

        usedJestFunctions.add(jestFnCall.name);
      },
      'Program:exit'() {
        const jestFunctionsToImport = Array.from(usedJestFunctions).filter(
          jestFunction => !importedJestFunctions.includes(jestFunction),
        );

        if (jestFunctionsToImport.length > 0) {
          const node = context.getSourceCode().ast;
          const jestFunctionsToImportFormatted =
            jestFunctionsToImport.join(', ');

          context.report({
            node,
            messageId: 'preferImportingJestGlobal',
            data: { jestFunctions: jestFunctionsToImportFormatted },
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const usesImport = sourceCode.ast.body.some(
                node => node.type === 'ImportDeclaration',
              );
              const [firstNode] = sourceCode.ast.body;

              let firstNodeValue;

              if (firstNode.type === 'ExpressionStatement') {
                const firstExpression = firstNode.expression as Literal;
                const { value } = firstExpression;

                firstNodeValue = value;
              }

              const useStrictDirectiveExists =
                firstNode.type === 'ExpressionStatement' &&
                firstNodeValue === 'use strict';

              if (useStrictDirectiveExists) {
                return fixer.insertTextAfter(
                  firstNode,
                  `\n${createFixerImports(usesImport, jestFunctionsToImport)}`,
                );
              }

              const importNode = sourceCode.ast.body.find(
                node =>
                  node.type === 'ImportDeclaration' &&
                  node.source.value === '@jest/globals',
              );

              if (importNode && importNode.type === 'ImportDeclaration') {
                const existingImports = importNode.specifiers.map(specifier => {
                  /* istanbul ignore else */
                  if (specifier.type === 'ImportSpecifier') {
                    return specifier.imported?.name;
                  }

                  // istanbul ignore next
                  return null;
                });
                const allImports = [
                  ...new Set([
                    ...existingImports.filter(
                      (imp): imp is string => imp !== null,
                    ),
                    ...jestFunctionsToImport,
                  ]),
                ];

                return fixer.replaceText(
                  importNode,
                  createFixerImports(usesImport, allImports),
                );
              }

              const requireNode = sourceCode.ast.body.find(
                node =>
                  node.type === 'VariableDeclaration' &&
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

              if (requireNode && requireNode.type === 'VariableDeclaration') {
                const existingImports =
                  requireNode.declarations[0]?.id.type === 'ObjectPattern'
                    ? requireNode.declarations[0]?.id.properties?.map(
                        property => {
                          /* istanbul ignore else */
                          if (property.type === 'Property') {
                            /* istanbul ignore else */
                            if (property.key.type === 'Identifier') {
                              return property.key.name;
                            }
                          }

                          // istanbul ignore next
                          return null;
                        },
                      ) ||
                      // istanbul ignore next
                      []
                    : // istanbul ignore next
                      [];
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
                  `${createFixerImports(usesImport, allImports)}`,
                );
              }

              return fixer.insertTextBefore(
                node,
                `${createFixerImports(usesImport, jestFunctionsToImport)}\n`,
              );
            },
          });
        }
      },
    };
  },
});
