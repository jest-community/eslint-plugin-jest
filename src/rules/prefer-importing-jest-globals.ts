import globalsJson from '../globals.json';
import { createRule, parseJestFnCall } from './utils';

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
    const jestGlobalFunctions = Object.keys(globalsJson);
    const importedJestFunctions: string[] = [];
    const usedJestFunctions = new Set<string>();

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }
        if (
          jestFnCall.head.type === 'import' &&
          jestGlobalFunctions.includes(jestFnCall.name)
        ) {
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
              return fixer.insertTextBefore(
                node,
                `import { ${jestFunctionsToImportFormatted} } from '@jest/globals';\n`,
              );
            },
          });
        }
      },
    };
  },
});
