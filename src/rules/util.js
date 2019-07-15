'use strict';

const path = require('path');
const { version } = require('../../package.json');

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

const expectCase = node =>
  node.callee.name === 'expect' &&
  node.arguments.length === 1 &&
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

const method = node => node.parent.property;

const method2 = node => node.parent.parent.property;

const methodName = node => method(node).name;

const methodName2 = node => method2(node).name;

const argument = node =>
  node.parent.parent.arguments && node.parent.parent.arguments[0];

const argument2 = node =>
  node.parent.parent.parent.arguments && node.parent.parent.parent.arguments[0];

const describeAliases = new Set([
  'describe',
  'describe.only',
  'describe.skip',
  'fdescribe',
  'xdescribe',
]);

const testCaseNames = new Set([
  'fit',
  'it',
  'it.only',
  'it.skip',
  'test',
  'test.only',
  'test.skip',
  'xit',
  'xtest',
]);

const testHookNames = new Set([
  'beforeAll',
  'beforeEach',
  'afterAll',
  'afterEach',
]);

const getNodeName = node => {
  function joinNames(a, b) {
    return a && b ? `${a}.${b}` : null;
  }

  switch (node && node.type) {
    case 'Identifier':
      return node.name;
    case 'Literal':
      return node.value;
    case 'TemplateLiteral':
      if (node.expressions.length === 0) return node.quasis[0].value.cooked;
      break;
    case 'MemberExpression':
      return joinNames(getNodeName(node.object), getNodeName(node.property));
  }

  return null;
};

const isHook = node =>
  node &&
  node.type === 'CallExpression' &&
  testHookNames.has(getNodeName(node.callee));

const isTestCase = node =>
  node &&
  node.type === 'CallExpression' &&
  testCaseNames.has(getNodeName(node.callee));

const isDescribe = node =>
  node &&
  node.type === 'CallExpression' &&
  describeAliases.has(getNodeName(node.callee));

const isFunction = node =>
  node &&
  (node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression');

const isString = node =>
  node &&
  ((node.type === 'Literal' && typeof node.value === 'string') ||
    isTemplateLiteral(node));

const isTemplateLiteral = node => node && node.type === 'TemplateLiteral';

const hasExpressions = node =>
  node && node.expressions && node.expressions.length > 0;

const getStringValue = arg =>
  isTemplateLiteral(arg) ? arg.quasis[0].value.raw : arg.value;

/**
 * Generates the URL to documentation for the given rule name. It uses the
 * package version to build the link to a tagged version of the
 * documentation file.
 *
 * @param {string} filename - Name of the eslint rule
 * @returns {string} URL to the documentation for the given rule
 */
const getDocsUrl = filename => {
  const ruleName = path.basename(filename, '.js');

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
};

const collectReferences = scope => {
  const locals = new Set();
  const unresolved = new Set();

  let currentScope = scope;

  while (currentScope !== null) {
    for (const ref of currentScope.variables) {
      const isReferenceDefined = ref.defs.some(def => {
        return def.type !== 'ImplicitGlobalVariable';
      });

      if (isReferenceDefined) {
        locals.add(ref.name);
      }
    }

    for (const ref of currentScope.through) {
      unresolved.add(ref.identifier.name);
    }

    currentScope = currentScope.upper;
  }

  return { locals, unresolved };
};

const scopeHasLocalReference = (scope, referenceName) => {
  const references = collectReferences(scope);
  return (
    // referenceName was found as a local variable or function declaration.
    references.locals.has(referenceName) ||
    // referenceName was not found as an unresolved reference,
    // meaning it is likely not an implicit global reference.
    !references.unresolved.has(referenceName)
  );
};

function composeFixers(node) {
  return (...fixers) => {
    return fixerApi => {
      return fixers.reduce((all, fixer) => [...all, fixer(node, fixerApi)], []);
    };
  };
}

module.exports = {
  method,
  method2,
  argument,
  argument2,
  expectCase,
  expectNotCase,
  expectResolveCase,
  expectRejectCase,
  expectToBeCase,
  expectNotToBeCase,
  expectToEqualCase,
  expectNotToEqualCase,
  getNodeName,
  getStringValue,
  isDescribe,
  isFunction,
  isHook,
  isTemplateLiteral,
  isTestCase,
  isString,
  hasExpressions,
  getDocsUrl,
  scopeHasLocalReference,
  composeFixers,
};
