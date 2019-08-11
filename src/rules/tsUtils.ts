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

/**
 * A `Literal` with a `value` of type `string`.
 */
export interface StringLiteral<Value extends string = string>
  extends TSESTree.Literal {
  value: Value;
}

/**
 * Checks if the given `node` is a `StringLiteral`.
 *
 * If a `value` is provided & the `node` is a `StringLiteral`,
 * the `value` will be compared to that of the `StringLiteral`.
 *
 * @param {Node} node
 * @param {V?} value
 *
 * @return {node is StringLiteral<V>}
 *
 * @template {V}.
 */
const isStringLiteral = <V extends string>(
  node: TSESTree.Node,
  value?: V,
): node is StringLiteral<V> =>
  node.type === AST_NODE_TYPES.Literal &&
  typeof node.value === 'string' &&
  (value === undefined || node.value === value);

interface TemplateLiteral<Value extends string = string>
  extends TSESTree.TemplateLiteral {
  quasis: [TSESTree.TemplateElement & { value: { raw: Value; cooked: Value } }];
}

/**
 * Checks if the given `node` is a `TemplateLiteral`.
 *
 * Complex `TemplateLiteral`s are not considered specific, and so will return `false`.
 *
 * If a `value` is provided & the `node` is a `TemplateLiteral`,
 * the `value` will be compared to that of the `TemplateLiteral`.
 *
 * @param {Node} node
 * @param {V?} value
 *
 * @return {node is TemplateLiteral<V>}
 *
 * @template V
 */
export const isTemplateLiteral = <V extends string>(
  node: TSESTree.Node,
  value?: V,
): node is TemplateLiteral<V> =>
  node.type === AST_NODE_TYPES.TemplateLiteral &&
  (value === undefined ||
    (node.quasis.length === 1 && // bail out if not simple
      node.quasis[0].value.raw === value));

type StringNode<S extends string = string> =
  | StringLiteral<S>
  | TemplateLiteral<S>;

/**
 * Checks if the given `node` is a {@link StringNode}.
 *
 * @param {Node} node
 * @param {V?} specifics
 *
 * @return {node is StringNode}
 *
 * @template V
 */
export const isStringNode = <V extends string>(
  node: TSESTree.Node,
  specifics?: V,
): node is StringNode<V> =>
  isStringLiteral(node, specifics) || isTemplateLiteral(node, specifics);

/**
 * Gets the value of the given `StringNode`.
 *
 * If the `node` is a `TemplateLiteral`, the `raw` value is used;
 * otherwise, `value` is returned instead.
 *
 * @param {StringNode<S>} node
 *
 * @return {S}
 *
 * @template S
 */
export const getStringValue = <S extends string>(node: StringNode<S>): S =>
  isTemplateLiteral(node) ? node.quasis[0].value.raw : node.value;

/**
 * Represents a `CallExpression` with a single argument.
 */
export interface CallExpressionWithSingleArgument<
  Argument extends TSESTree.Expression = TSESTree.Expression
> extends TSESTree.CallExpression {
  arguments: [Argument];
}

/**
 * Guards that the given `call` has only one `argument`.
 *
 * @param {CallExpression} call
 *
 * @return {call is CallExpressionWithSingleArgument}
 */
export const hasOnlyOneArgument = (
  call: TSESTree.CallExpression,
): call is CallExpressionWithSingleArgument =>
  call.arguments && call.arguments.length === 1;

/**
 * Gets the value of the given `AccessorNode`,
 * account for the different node types.
 *
 * @param {AccessorNode<S>} accessor
 *
 * @return {S}
 *
 * @template S
 */
export const getAccessorValue = <S extends string = string>(
  accessor: AccessorNode<S>,
): S => getStringValue(accessor);

type AccessorNode<Specifics extends string = string> = StringNode<Specifics>;

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

/**
 * Checks if the given `node` is a {@link JestExpectCallExpression}.
 *
 * @param {Node} node
 *
 * @return {node is JestExpectCallExpression}
 */
export const isExpectCall = (
  node: TSESTree.Node,
): node is JestExpectCallExpression =>
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
