// TODO: rename to utils.ts when TS migration is complete
import { basename } from 'path';
import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { version } from '../../package.json';

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

export const createRule = ESLintUtils.RuleCreator(name => {
  const ruleName = basename(name, '.ts');
  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});

interface JestExpectIdentifier extends TSESTree.Identifier {
  name: 'expect';
}

/**
 * Checks if the given `node` is considered a {@link JestExpectIdentifier}.
 *
 * A `node` is considered to be as such if it is of type `Identifier`,
 * and `name`d `"expect"`.
 *
 * @param {Node} node
 *
 * @return {node is JestExpectIdentifier}
 */
const isExpectIdentifier = (
  node: TSESTree.Node,
): node is JestExpectIdentifier =>
  node.type === AST_NODE_TYPES.Identifier && node.name === 'expect';

// represents "expect()" specifically
interface JestExpectCallExpression extends TSESTree.CallExpression {
  callee: JestExpectIdentifier;
}

// represents expect usage like "expect().toBe" & "expect().not.toBe"
interface JestExpectCallMemberExpression extends TSESTree.MemberExpression {
  object: JestExpectCallMemberExpression | JestExpectCallExpression;
  property: TSESTree.Identifier;
}

// represents expect usage like "expect.anything" & "expect.hasAssertions"
interface JestExpectNamespaceMemberExpression
  extends TSESTree.MemberExpression {
  object: JestExpectIdentifier;
  property: TSESTree.Identifier;
}

/**
 * Checks if the given `node` is a {@link JestExpectCallExpression}.
 *
 * @param {Node} node
 *
 * @return {node is JestExpectCallExpression}
 */
const isExpectCall = (node: TSESTree.Node): node is JestExpectCallExpression =>
  node.type === AST_NODE_TYPES.CallExpression &&
  isExpectIdentifier(node.callee);

interface JestExpectCallWithParent extends JestExpectCallExpression {
  parent: JestExpectCallMemberExpression;
}

export const isExpectCallWithParent = (
  node: TSESTree.Node,
): node is JestExpectCallWithParent =>
  isExpectCall(node) &&
  node.parent !== undefined &&
  node.parent.type === AST_NODE_TYPES.MemberExpression &&
  node.parent.property.type === AST_NODE_TYPES.Identifier;

export enum DescribeAlias {
  'describe' = 'describe',
  'fdescribe' = 'fdescribe',
  'xdescribe' = 'xdescribe',
}

export enum TestCaseName {
  'fit' = 'fit',
  'it' = 'it',
  'test' = 'test',
  'xit' = 'xit',
  'xtest' = 'xtest',
}

export enum HookName {
  'beforeAll' = 'beforeAll',
  'beforeEach' = 'beforeEach',
  'afterAll' = 'afterAll',
  'afterEach' = 'afterEach',
}

export enum DescribeProperty {
  'each' = 'each',
  'only' = 'only',
  'skip' = 'skip',
}

export enum TestCaseProperty {
  'each' = 'each',
  'only' = 'only',
  'skip' = 'skip',
  'todo' = 'todo',
}

export type JestFunctionName = DescribeAlias | TestCaseName | HookName;

export interface JestFunctionIdentifier<FunctionName extends JestFunctionName>
  extends TSESTree.Identifier {
  name: FunctionName;
}

export interface JestFunctionMemberExpression<
  FunctionName extends JestFunctionName
> extends TSESTree.MemberExpression {
  object: JestFunctionIdentifier<FunctionName>;
}

export interface JestFunctionCallExpressionWithMemberExpressionCallee<
  FunctionName extends JestFunctionName
> extends TSESTree.CallExpression {
  callee: JestFunctionMemberExpression<FunctionName>;
}

export interface JestFunctionCallExpressionWithIdentifierCallee<
  FunctionName extends JestFunctionName
> extends TSESTree.CallExpression {
  callee: JestFunctionIdentifier<FunctionName>;
}

export type JestFunctionCallExpression<
  FunctionName extends JestFunctionName = JestFunctionName
> =
  | JestFunctionCallExpressionWithMemberExpressionCallee<FunctionName>
  | JestFunctionCallExpressionWithIdentifierCallee<FunctionName>;

export function getNodeName(
  node:
    | JestFunctionMemberExpression<JestFunctionName>
    | JestFunctionIdentifier<JestFunctionName>,
): string;
export function getNodeName(node: TSESTree.Node): string | null;
export function getNodeName(node: TSESTree.Node): string | null {
  function joinNames(a?: string | null, b?: string | null): string | null {
    return a && b ? `${a}.${b}` : null;
  }

  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
      return node.name;
    case AST_NODE_TYPES.Literal:
      return `${node.value}`;
    case AST_NODE_TYPES.TemplateLiteral:
      if (node.expressions.length === 0) return node.quasis[0].value.cooked;
      break;
    case AST_NODE_TYPES.MemberExpression:
      return joinNames(getNodeName(node.object), getNodeName(node.property));
  }

  return null;
}

export type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export const isFunction = (node: TSESTree.Node): node is FunctionExpression =>
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const isHook = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpressionWithIdentifierCallee<HookName> => {
  return (
    node.callee.type === AST_NODE_TYPES.Identifier &&
    HookName.hasOwnProperty(node.callee.name)
  );
};

export const isTestCase = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<TestCaseName> => {
  return (
    (node.callee.type === AST_NODE_TYPES.Identifier &&
      TestCaseName.hasOwnProperty(node.callee.name)) ||
    (node.callee.type === AST_NODE_TYPES.MemberExpression &&
      node.callee.object.type === AST_NODE_TYPES.Identifier &&
      TestCaseName.hasOwnProperty(node.callee.object.name) &&
      node.callee.property.type === AST_NODE_TYPES.Identifier &&
      TestCaseProperty.hasOwnProperty(node.callee.property.name))
  );
};

export const isDescribe = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<DescribeAlias> => {
  return (
    (node.callee.type === AST_NODE_TYPES.Identifier &&
      DescribeAlias.hasOwnProperty(node.callee.name)) ||
    (node.callee.type === AST_NODE_TYPES.MemberExpression &&
      node.callee.object.type === AST_NODE_TYPES.Identifier &&
      DescribeAlias.hasOwnProperty(node.callee.object.name) &&
      node.callee.property.type === AST_NODE_TYPES.Identifier &&
      DescribeProperty.hasOwnProperty(node.callee.property.name))
  );
};

export const isLiteralNode = (node: {
  type: AST_NODE_TYPES;
}): node is TSESTree.Literal => node.type === AST_NODE_TYPES.Literal;

export interface StringLiteral extends TSESTree.Literal {
  value: string;
}

export type StringNode = StringLiteral | TSESTree.TemplateLiteral;

export const isStringLiteral = (node: TSESTree.Node): node is StringLiteral =>
  node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string';

export const isTemplateLiteral = (
  node: TSESTree.Node,
): node is TSESTree.TemplateLiteral =>
  node && node.type === AST_NODE_TYPES.TemplateLiteral;

export const isStringNode = (node: TSESTree.Node): node is StringNode =>
  isStringLiteral(node) || isTemplateLiteral(node);

/* istanbul ignore next we'll need this later */
export const getStringValue = (arg: StringNode): string =>
  isTemplateLiteral(arg) ? arg.quasis[0].value.raw : arg.value;

const collectReferences = (scope: TSESLint.Scope.Scope) => {
  const locals = new Set();
  const unresolved = new Set();

  let currentScope: TSESLint.Scope.Scope | null = scope;

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

export const scopeHasLocalReference = (
  scope: TSESLint.Scope.Scope,
  referenceName: string,
) => {
  const references = collectReferences(scope);
  return (
    // referenceName was found as a local variable or function declaration.
    references.locals.has(referenceName) ||
    // referenceName was not found as an unresolved reference,
    // meaning it is likely not an implicit global reference.
    !references.unresolved.has(referenceName)
  );
};
