import { posix } from 'path';
import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule, getStringValue, isStringNode } from './utils';

const mocksDirName = '__mocks__';

const isMockPath = (path: string) =>
  path.split(posix.sep).includes(mocksDirName);

const isMockImportLiteral = (expression: TSESTree.Expression): boolean =>
  isStringNode(expression) && isMockPath(getStringValue(expression));

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description: 'Disallow manually importing from __mocks__ ',
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
        if (node.source && isMockImportLiteral(node.source)) {
          context.report({ node, messageId: 'noManualImport' });
        }
      },
      'CallExpression[callee.name="require"]'(node: TSESTree.CallExpression) {
        const [arg] = node.arguments;

        if (arg && isMockImportLiteral(arg)) {
          context.report({
            node: arg,
            messageId: 'noManualImport',
          });
        }
      },
    };
  },
});
