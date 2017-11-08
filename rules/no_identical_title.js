'use strict';

const describeAliases = Object.assign(Object.create(null), {
  describe: true,
  'describe.only': true,
  'describe.skip': true,
  fdescribe: true,
  xdescribe: true,
});

const testCaseNames = Object.assign(Object.create(null), {
  fit: true,
  it: true,
  'it.only': true,
  'it.skip': true,
  test: true,
  'test.only': true,
  'test.skip': true,
  xit: true,
  xtest: true,
});

const getNodeName = node => {
  if (node.type === 'MemberExpression') {
    return node.object.name + '.' + node.property.name;
  }
  return node.name;
};

const isDescribe = node =>
  node &&
  node.type === 'CallExpression' &&
  describeAliases[getNodeName(node.callee)];

const isTestCase = node =>
  node &&
  node.type === 'CallExpression' &&
  testCaseNames[getNodeName(node.callee)];

const newDescribeContext = () => ({
  describeTitles: [],
  testTitles: [],
});

const handleTestCaseTitles = (context, titles, node, title) => {
  if (isTestCase(node)) {
    if (titles.indexOf(title) !== -1) {
      context.report({
        message: 'Test title is used multiple times in the same test suite.',
        node,
      });
    }
    titles.push(title);
  }
};

const handleTestSuiteTitles = (context, titles, node, title) => {
  if (!isDescribe(node)) {
    return;
  }
  if (titles.indexOf(title) !== -1) {
    context.report({
      message: 'Test suite title is used multiple times.',
      node,
    });
  }
  titles.push(title);
};

const isFirstArgLiteral = node =>
  node.arguments && node.arguments[0] && node.arguments[0].type === 'Literal';

module.exports = context => {
  const contexts = [newDescribeContext()];
  return {
    CallExpression(node) {
      const currentLayer = contexts[contexts.length - 1];
      if (isDescribe(node)) {
        contexts.push(newDescribeContext());
      }
      if (!isFirstArgLiteral(node)) {
        return;
      }

      const title = node.arguments[0].value;
      handleTestCaseTitles(context, currentLayer.testTitles, node, title);
      handleTestSuiteTitles(context, currentLayer.describeTitles, node, title);
    },
    'CallExpression:exit'(node) {
      if (isDescribe(node)) {
        contexts.pop();
      }
    },
  };
};
