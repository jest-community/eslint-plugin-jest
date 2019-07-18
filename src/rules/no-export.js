import { getDocsUrl, isTestCase } from './util';

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      unexpectedExport: `Do not export from a test file.`,
    },
    schema: [],
  },
  create(context) {
    const exportNodes = [];
    let hasTestCase = false;

    return {
      'Program:exit'() {
        if (hasTestCase && exportNodes.length > 0) {
          for (let node of exportNodes) {
            context.report({ node, messageId: 'unexpectedExport' });
          }
        }
      },

      CallExpression(node) {
        if (isTestCase(node)) {
          hasTestCase = true;
        }
      },
      'ExportNamedDeclaration, ExportDefaultDeclaration'(node) {
        exportNodes.push(node);
      },
      'AssignmentExpression > MemberExpression'(node) {
        let { object, property } = node;

        if (object.type === 'MemberExpression') {
          ({ object, property } = object);
        }

        if (object.name === 'module' && /^exports?$/.test(property.name)) {
          exportNodes.push(node);
        }
      },
    };
  },
};
