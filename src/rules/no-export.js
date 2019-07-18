import { getDocsUrl, isTestCase } from './util';

let exportNodes = [];
let hasTestCase = false;
const messageId = 'unexpectedExport';
export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      [messageId]: `Do not export from a test file.`,
    },
    schema: [],
  },
  create(context) {
    return {
      'Program:exit'() {
        if (hasTestCase && exportNodes.length > 0) {
          for (let node of exportNodes) {
            context.report({ node, messageId });
          }
        }
        exportNodes = [];
        hasTestCase = false;
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

        if (object.name === 'module' && !!property.name.match(/^exports?$/)) {
          exportNodes.push(node);
        }
      },
    };
  },
};
