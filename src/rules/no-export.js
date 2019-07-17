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
      ExportNamedDeclaration(node) {
        context.report({ node, messageId: 'unexpectedExport' });
      },
    };
  },
};
