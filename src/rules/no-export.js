import { getDocsUrl } from './util';

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
    return {
      'ExportNamedDeclaration, ExportDefaultDeclaration'(node) {
        context.report({ node, messageId: 'unexpectedExport' });
      },
      'AssignmentExpression > MemberExpression'(node) {
        let { object, property } = node;

        if (object.type === 'MemberExpression') {
          ({ object, property } = object);
        }

        if (object.name === 'module' && !!property.name.match(/^exports?$/)) {
          context.report({ node, messageId: 'unexpectedExport' });
        }
      },
    };
  },
};
