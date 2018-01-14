'use strict';

const ruleMsg =
  'it(), test() and describe() descriptions should begin with lowercase';

const isItTestOrDescribeFunction = node => {
  return (
    node.type === 'CallExpression' &&
    node.callee &&
    (node.callee.name === 'it' ||
      node.callee.name === 'test' ||
      node.callee.name === 'describe')
  );
};

const isItDescription = node => {
  return (
    node.arguments &&
    node.arguments[0] &&
    (node.arguments[0].type === 'Literal' ||
      node.arguments[0].type === 'TemplateLiteral')
  );
};

const testDescription = node => {
  const type = node.arguments[0].type;
  if (type === 'Literal') {
    return node.arguments[0].value;
  }
  if (type === 'TemplateLiteral') {
    return node.arguments[0].quasis[0].value.raw;
  }
};

const descriptionBeginsWithLowerCase = node => {
  if (isItTestOrDescribeFunction(node) && isItDescription(node)) {
    const description = testDescription(node);
    if (!description[0]) {
      return true;
    }
    return description[0] === description[0].toLowerCase();
  }
  return true;
};

module.exports = {
  meta: {
    docs: {
      url:
        'https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/lowercase-description.md',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!descriptionBeginsWithLowerCase(node)) {
          context.report({
            message: ruleMsg,
            node: node,
          });
        }
      },
    };
  },
};
