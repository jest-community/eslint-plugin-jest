import { TSESTree } from '@typescript-eslint/experimental-utils';
import { posix } from 'path';
import { createRule, isLiteralNode } from './tsUtils';

const mocksDirName = '__mocks__';

const isMockPath = (path: string) =>
  path.split(posix.sep).includes(mocksDirName);

const isMockImportLiteral = (expression?: TSESTree.Expression): boolean =>
  expression !== undefined &&
  isLiteralNode(expression) &&
  typeof expression.value === 'string' &&
  isMockPath(expression.value);

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      description:
        'When using `jest.mock`, your tests (just like the code being tested) should import from `./x`, not `./__mocks__/x`. Not following this rule can lead to confusion, because you will have multiple instances of the mocked module',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noManualImport: `Mocks should not be manually imported from a ${mocksDirName} directory. Instead use jest.mock and import from the original module path.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (isMockImportLiteral(node.source)) {
          context.report({ node, messageId: 'noManualImport' });
        }
      },
      'CallExpression[callee.name="require"]'(node: TSESTree.CallExpression) {
        if (isMockImportLiteral(node.arguments[0])) {
          context.report({
            node: node.arguments[0],
            messageId: 'noManualImport',
          });
        }
      },
    };
  },
});
