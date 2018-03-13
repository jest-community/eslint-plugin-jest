'use strict';

module.exports = function parseExpect(node) {
  if (node && node.type === 'CallExpression' && node.callee.name === 'expect') {
    const properties = [];
    let matcherArguments = [];
    let matcher = undefined;
    let parent = node.parent;
    while (parent) {
      if (parent.type === 'MemberExpression') {
        const grandParentType = parent.parent && parent.parent.type;
        switch (grandParentType) {
          case 'CallExpression': {
            matcher = parent.property;
            matcherArguments = matcherArguments.concat(parent.parent.arguments);
            break;
          }
          case 'MemberExpression':
          case 'ExpressionStatement': {
            properties.push(parent.property);
            break;
          }
        }
      }
      parent = parent.parent;
    }
    return {
      arguments: node.arguments,
      properties,
      matcher,
      matcherArguments,
    };
  }
  return null;
};
