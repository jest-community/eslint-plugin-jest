import { basename } from 'path';
import { version } from '../../package.json';

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

export const expectCase = node =>
  node && node.callee && node.callee.name === 'expect';

export const expectCaseWithParent = node =>
  expectCase(node) &&
  node.parent &&
  node.parent.type === 'MemberExpression' &&
  node.parent.parent;

export const expectNotCase = node =>
  expectCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node) === 'not';

export const expectResolvesCase = node =>
  expectCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node) === 'resolves';

export const expectNotResolvesCase = node =>
  expectNotCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node.parent) === 'resolves';

export const expectRejectsCase = node =>
  expectCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node) === 'rejects';

export const expectNotRejectsCase = node =>
  expectNotCase(node) &&
  node.parent.parent.type === 'MemberExpression' &&
  methodName(node.parent) === 'rejects';

export const expectToBeCase = (node, arg) =>
  !(
    expectNotCase(node) ||
    expectResolvesCase(node) ||
    expectRejectsCase(node)
  ) &&
  expectCase(node) &&
  methodName(node) === 'toBe' &&
  argument(node) &&
  ((argument(node).type === 'Literal' &&
    argument(node).value === null &&
    arg === null) ||
    (argument(node).name === 'undefined' && arg === undefined));

export const expectNotToBeCase = (node, arg) =>
  expectNotCase(node) &&
  methodName2(node) === 'toBe' &&
  argument2(node) &&
  ((argument2(node).type === 'Literal' &&
    argument2(node).value === null &&
    arg === null) ||
    (argument2(node).name === 'undefined' && arg === undefined));

export const expectToEqualCase = (node, arg) =>
  !(
    expectNotCase(node) ||
    expectResolvesCase(node) ||
    expectRejectsCase(node)
  ) &&
  expectCase(node) &&
  methodName(node) === 'toEqual' &&
  argument(node) &&
  ((argument(node).type === 'Literal' &&
    argument(node).value === null &&
    arg === null) ||
    (argument(node).name === 'undefined' && arg === undefined));

export const expectNotToEqualCase = (node, arg) =>
  expectNotCase(node) &&
  methodName2(node) === 'toEqual' &&
  argument2(node) &&
  ((argument2(node).type === 'Literal' &&
    argument2(node).value === null &&
    arg === null) ||
    (argument2(node).name === 'undefined' && arg === undefined));

export const method = node => node.parent.property;

export const method2 = node => node.parent.parent.property;

const methodName = node => method(node) && method(node).name;

const methodName2 = node => method2(node) && method2(node).name;

export const argument = node =>
  node.parent.parent.arguments && node.parent.parent.arguments[0];

export const argument2 = node =>
  node.parent.parent.parent.arguments && node.parent.parent.parent.arguments[0];

/**
 * Generates the URL to documentation for the given rule name. It uses the
 * package version to build the link to a tagged version of the
 * documentation file.
 *
 * @param {string} filename - Name of the eslint rule
 * @returns {string} URL to the documentation for the given rule
 */
export const getDocsUrl = filename => {
  const ruleName = basename(filename, '.js');

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
};
