'use strict';

const expectCase = node =>
  node.callee.name === 'expect' &&
  node.arguments.length == 1 &&
  node.parent &&
  node.parent.type === 'MemberExpression' &&
  node.parent.parent;

const expectNotCase = node =>
  expectCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node) === 'not';

const expectResolveCase = node =>
  expectCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node) === 'resolve';

const expectRejectCase = node =>
  expectCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node) === 'reject';

const expectToBeCase = (node, arg) =>
  !(expectNotCase(node) || expectResolveCase(node) || expectRejectCase(node)) &&
  expectCase(node) &&
  methodName(node) === 'toBe' &&
  argument(node) &&
  ((argument(node).type === 'Literal' &&
    argument(node).value === null &&
    arg === null) ||
    (argument(node).name === 'undefined' && arg === undefined));

const expectNotToBeCase = (node, arg) =>
  expectNotCase(node) &&
  methodName2(node) === 'toBe' &&
  argument2(node) &&
  ((argument2(node).type === 'Literal' &&
    argument2(node).value === null &&
    arg === null) ||
    (argument2(node).name === 'undefined' && arg === undefined));

const expectToEqualCase = (node, arg) =>
  !(expectNotCase(node) || expectResolveCase(node) || expectRejectCase(node)) &&
  expectCase(node) &&
  methodName(node) === 'toEqual' &&
  argument(node) &&
  ((argument(node).type === 'Literal' &&
    argument(node).value === null &&
    arg === null) ||
    (argument(node).name === 'undefined' && arg === undefined));

const expectNotToEqualCase = (node, arg) =>
  expectNotCase(node) &&
  methodName2(node) === 'toEqual' &&
  argument2(node) &&
  ((argument2(node).type === 'Literal' &&
    argument2(node).value === null &&
    arg === null) ||
    (argument2(node).name === 'undefined' && arg === undefined));

const expectToBeUndefinedCase = node =>
  !(expectNotCase(node) || expectResolveCase(node) || expectRejectCase(node)) &&
  expectCase(node) &&
  methodName(node) === 'toBeUndefined';

const expectNotToBeUndefinedCase = node =>
  expectNotCase(node) && methodName2(node) === 'toBeUndefined';

const method = node => node.parent.property;

const method2 = node => node.parent.parent.property;

const methodName = node => method(node).name;

const methodName2 = node => method2(node).name;

const argument = node => node.parent.parent.arguments[0];

const argument2 = node => node.parent.parent.parent.arguments[0];

module.exports = {
  method: method,
  method2: method2,
  argument: argument,
  argument2: argument2,
  expectCase: expectCase,
  expectNotCase: expectNotCase,
  expectResolveCase: expectResolveCase,
  expectRejectCase: expectRejectCase,
  expectToBeCase: expectToBeCase,
  expectNotToBeCase: expectNotToBeCase,
  expectToEqualCase: expectToEqualCase,
  expectNotToEqualCase: expectNotToEqualCase,
  expectToBeUndefinedCase: expectToBeUndefinedCase,
  expectNotToBeUndefinedCase: expectNotToBeUndefinedCase,
};
