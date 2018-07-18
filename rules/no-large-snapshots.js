'use strict';

const getDocsUrl = require('./util').getDocsUrl;

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    if (context.getFilename().endsWith('.snap')) {
      const lineLimit =
        context.options[0] && Number.isFinite(context.options[0].maxSize)
          ? context.options[0].maxSize
          : 50;

      return {
        ExpressionStatement(node) {
          const startLine = node.loc.start.line;
          const endLine = node.loc.end.line;
          const lineCount = endLine - startLine;

          if (lineCount > lineLimit) {
            context.report({
              message:
                lineLimit === 0
                  ? 'Expected to not encounter a Jest snapshot but was found with {{ lineCount }} lines long'
                  : 'Expected Jest snapshot to be smaller than {{ lineLimit }} lines but was {{ lineCount }} lines long',
              data: { lineLimit, lineCount },
              node,
            });
          }
        },
      };
    }

    return {};
  },
};
