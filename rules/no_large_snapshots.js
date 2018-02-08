'use strict';

module.exports = {
  meta: {
    docs: {
      url:
        'https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-large-snapshots.md',
    },
  },
  create(context) {
    if (context.getFilename().endsWith('.snap')) {
      const lineLimit =
        (context.options[0] && context.options[0].maxSize) || 50;

      return {
        ExpressionStatement: node => {
          const startLine = node.loc.start.line;
          const endLine = node.loc.end.line;
          const lineCount = endLine - startLine;

          if (lineCount > lineLimit) {
            context.report({
              message:
                'Expected Jest snapshot to be smaller than {{ lineLimit }} lines but was {{ lineCount }} lines long',
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
