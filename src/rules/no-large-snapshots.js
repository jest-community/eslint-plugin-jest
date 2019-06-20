'use strict';

const {
  getDocsUrl,
  isDescribe,
  isTestCase,
  getStringValue,
} = require('./util');

const allSnapshots = {};

let titles = [];
let snapshotCall = 0;

const reportToMatchSnapshot = (context, snapshotName) => {
  const props = ['lineCount', 'lineLimit', 'node'];
  for (let prop of props) {
    if (!allSnapshots[snapshotName].hasOwnProperty(prop)) {
      return;
    }
  }
  const { lineLimit, lineCount, node } = allSnapshots[snapshotName];

  reportOnViolation(lineCount, lineLimit, context, node);

  delete allSnapshots[snapshotName];
};

const captureSnapshot = (context, node) => {
  const { lineCount, lineLimit } = getSnapshotStats(context, node);

  if (node.expression && node.expression.left) {
    const snapshotName = getStringValue(node.expression.left.property);

    allSnapshots[snapshotName] = allSnapshots[snapshotName] || {};
    allSnapshots[snapshotName].lineCount = lineCount;
    allSnapshots[snapshotName].lineLimit = lineLimit;

    reportToMatchSnapshot(context, snapshotName);
  }
};
const reportOnViolation = (lineCount, lineLimit, context, node) => {
  if (lineCount > lineLimit) {
    context.report({
      messageId: lineLimit === 0 ? 'noSnapshot' : 'tooLongSnapshots',
      data: { lineLimit, lineCount },
      node,
    });
  }
};
const captureToMatchSnapshot = (context, node) => {
  const snapshotName = `${titles.join(' ')} ${++snapshotCall}`; //getSnapshotName(context, node);

  allSnapshots[snapshotName] = allSnapshots[snapshotName] || {};
  allSnapshots[snapshotName].node = node;

  reportToMatchSnapshot(context, snapshotName);
};

const getSnapshotStats = (context, node) => {
  const lineLimit =
    context.options[0] && Number.isFinite(context.options[0].maxSize)
      ? context.options[0].maxSize
      : 50;
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  const lineCount = endLine - startLine;

  return { lineCount, lineLimit };
};
const captureInlineSnapshot = (context, node) => {
  const { lineCount, lineLimit } = getSnapshotStats(context, node);

  reportOnViolation(lineCount, lineLimit, context, node);
};

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      noSnapshot: '`{{ lineCount }}`s should begin with lowercase',
      tooLongSnapshots:
        'Expected Jest snapshot to be smaller than {{ lineLimit }} lines but was {{ lineCount }} lines long',
    },
  },
  create(context) {
    if (context.getFilename().endsWith('.snap')) {
      return {
        ExpressionStatement(node) {
          captureSnapshot(context, node);
        },
      };
    } else if (context.getFilename().endsWith('.js')) {
      return {
        CallExpression(node) {
          if (isTestCase(node) || isDescribe(node)) {
            const [firstArgument] = node.arguments;
            titles.push(getStringValue(firstArgument));
          } else {
            const propertyName =
              node.callee.property && node.callee.property.name;
            if (
              propertyName === 'toMatchInlineSnapshot' ||
              propertyName === 'toThrowErrorMatchingInlineSnapshot'
            ) {
              captureInlineSnapshot(context, node);
            } else if (propertyName === 'toMatchSnapshot') {
              captureToMatchSnapshot(context, node);
            }
          }
        },
        'CallExpression:exit'(node) {
          if (isDescribe(node) || isTestCase(node)) {
            titles.pop();
            snapshotCall = 0;
          }
        },
      };
    }

    return {};
  },
};
