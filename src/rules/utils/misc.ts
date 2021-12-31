import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  DescribeProperty,
  HookName,
  TestCaseName,
  TestCaseProperty,
} from './enums';
import {
  JestFunctionCallExpression,
  JestFunctionCallExpressionWithIdentifierCallee,
} from './types';

/**
 * A `Literal` with a `value` of type `string`.
 */
interface StringLiteral<Value extends string = string>
  extends TSESTree.StringLiteral {
  value: Value;
}

/**
 * Checks if the given `node` is a `StringLiteral`.
 *
 * If a `value` is provided & the `node` is a `StringLiteral`,
 * the `value` will be compared to that of the `StringLiteral`.
 *
 * @param {Node} node
 * @param {V} [value]
 *
 * @return {node is StringLiteral<V>}
 *
 * @template V
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
 * @param {V} [value]
 *
 * @return {node is TemplateLiteral<V>}
 *
 * @template V
 */
const isTemplateLiteral = <V extends string>(
  node: TSESTree.Node,
  value?: V,
): node is TemplateLiteral<V> =>
  node.type === AST_NODE_TYPES.TemplateLiteral &&
  node.quasis.length === 1 && // bail out if not simple
  (value === undefined || node.quasis[0].value.raw === value);

export type StringNode<S extends string = string> =
  | StringLiteral<S>
  | TemplateLiteral<S>;

/**
 * Checks if the given `node` is a {@link StringNode}.
 *
 * @param {Node} node
 * @param {V} [specifics]
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
 * Represents a `MemberExpression` with a "known" `property`.
 */
export interface KnownMemberExpression<Name extends string = string>
  extends TSESTree.MemberExpressionComputedName {
  property: AccessorNode<Name>;
}

/**
 * Represents a `CallExpression` with a "known" `property` accessor.
 *
 * i.e `KnownCallExpression<'includes'>` represents `.includes()`.
 */
export interface KnownCallExpression<Name extends string = string>
  extends TSESTree.CallExpression {
  callee: CalledKnownMemberExpression<Name>;
}

/**
 * Represents a `MemberExpression` with a "known" `property`, that is called.
 *
 * This is `KnownCallExpression` from the perspective of the `MemberExpression` node.
 */
interface CalledKnownMemberExpression<Name extends string = string>
  extends KnownMemberExpression<Name> {
  parent: KnownCallExpression<Name>;
}

/**
 * Represents a `CallExpression` with a single argument.
 */
export interface CallExpressionWithSingleArgument<
  Argument extends TSESTree.Expression = TSESTree.Expression,
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
): call is CallExpressionWithSingleArgument => call.arguments.length === 1;

/**
 * An `Identifier` with a known `name` value - i.e `expect`.
 */
export interface KnownIdentifier<Name extends string>
  extends TSESTree.Identifier {
  name: Name;
}

/**
 * Checks if the given `node` is an `Identifier`.
 *
 * If a `name` is provided, & the `node` is an `Identifier`,
 * the `name` will be compared to that of the `identifier`.
 *
 * @param {Node} node
 * @param {V} [name]
 *
 * @return {node is KnownIdentifier<Name>}
 *
 * @template V
 */
export const isIdentifier = <V extends string>(
  node: TSESTree.Node,
  name?: V,
): node is KnownIdentifier<V> =>
  node.type === AST_NODE_TYPES.Identifier &&
  (name === undefined || node.name === name);

/**
 * Checks if the given `node` is a "supported accessor".
 *
 * This means that it's a node can be used to access properties,
 * and who's "value" can be statically determined.
 *
 * `MemberExpression` nodes most commonly contain accessors,
 * but it's possible for other nodes to contain them.
 *
 * If a `value` is provided & the `node` is an `AccessorNode`,
 * the `value` will be compared to that of the `AccessorNode`.
 *
 * Note that `value` here refers to the normalised value.
 * The property that holds the value is not always called `name`.
 *
 * @param {Node} node
 * @param {V} [value]
 *
 * @return {node is AccessorNode<V>}
 *
 * @template V
 */
export const isSupportedAccessor = <V extends string>(
  node: TSESTree.Node,
  value?: V,
): node is AccessorNode<V> =>
  isIdentifier(node, value) || isStringNode(node, value);

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
): S =>
  accessor.type === AST_NODE_TYPES.Identifier
    ? accessor.name
    : getStringValue(accessor);

export type AccessorNode<Specifics extends string = string> =
  | StringNode<Specifics>
  | KnownIdentifier<Specifics>;

export type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export const isFunction = (node: TSESTree.Node): node is FunctionExpression =>
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const isHook = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpressionWithIdentifierCallee<HookName> =>
  node.callee.type === AST_NODE_TYPES.Identifier &&
  HookName.hasOwnProperty(node.callee.name);

export const getTestCallExpressionsFromDeclaredVariables = (
  declaredVariables: readonly TSESLint.Scope.Variable[],
): Array<JestFunctionCallExpression<TestCaseName>> => {
  return declaredVariables.reduce<
    Array<JestFunctionCallExpression<TestCaseName>>
  >(
    (acc, { references }) =>
      acc.concat(
        references
          .map(({ identifier }) => identifier.parent)
          .filter(
            (node): node is JestFunctionCallExpression<TestCaseName> =>
              !!node &&
              node.type === AST_NODE_TYPES.CallExpression &&
              isTestCaseCall(node),
          ),
      ),
    [],
  );
};

const isTestCaseName = (node: TSESTree.LeftHandSideExpression) =>
  node.type === AST_NODE_TYPES.Identifier &&
  TestCaseName.hasOwnProperty(node.name);

const isTestCaseProperty = (
  node: TSESTree.Expression | TSESTree.PrivateIdentifier,
): node is AccessorNode<TestCaseProperty> =>
  isSupportedAccessor(node) &&
  TestCaseProperty.hasOwnProperty(getAccessorValue(node));

/**
 * Checks if the given `node` is a *call* to a test case function that would
 * result in tests being run by `jest`.
 *
 * Note that `.each()` does not count as a call in this context, as it will not
 * result in `jest` running any tests.
 *
 * @param {TSESTree.CallExpression} node
 *
 * @return {node is JestFunctionCallExpression<TestCaseName>}
 */
export const isTestCaseCall = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<TestCaseName> => {
  if (isTestCaseName(node.callee)) {
    return true;
  }

  const callee =
    node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
      ? node.callee.tag
      : node.callee.type === AST_NODE_TYPES.CallExpression
      ? node.callee.callee
      : node.callee;

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    isTestCaseProperty(callee.property)
  ) {
    // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
    if (
      getAccessorValue(callee.property) === 'each' &&
      node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression &&
      node.callee.type !== AST_NODE_TYPES.CallExpression
    ) {
      return false;
    }

    return callee.object.type === AST_NODE_TYPES.MemberExpression
      ? isTestCaseName(callee.object.object)
      : isTestCaseName(callee.object);
  }

  return false;
};

const isDescribeAlias = (node: TSESTree.LeftHandSideExpression) =>
  node.type === AST_NODE_TYPES.Identifier &&
  DescribeAlias.hasOwnProperty(node.name);

const isDescribeProperty = (
  node: TSESTree.Expression | TSESTree.PrivateIdentifier,
): node is AccessorNode<DescribeProperty> =>
  isSupportedAccessor(node) &&
  DescribeProperty.hasOwnProperty(getAccessorValue(node));

/**
 * Checks if the given `node` is a *call* to a `describe` function that would
 * result in a `describe` block being created by `jest`.
 *
 * Note that `.each()` does not count as a call in this context, as it will not
 * result in `jest` creating any `describe` blocks.
 *
 * @param {TSESTree.CallExpression} node
 *
 * @return {node is JestFunctionCallExpression<TestCaseName>}
 */
export const isDescribeCall = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<DescribeAlias> => {
  if (isDescribeAlias(node.callee)) {
    return true;
  }

  const callee =
    node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
      ? node.callee.tag
      : node.callee.type === AST_NODE_TYPES.CallExpression
      ? node.callee.callee
      : node.callee;

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    isDescribeProperty(callee.property)
  ) {
    // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
    if (
      getAccessorValue(callee.property) === 'each' &&
      node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression &&
      node.callee.type !== AST_NODE_TYPES.CallExpression
    ) {
      return false;
    }

    return callee.object.type === AST_NODE_TYPES.MemberExpression
      ? isDescribeAlias(callee.object.object)
      : isDescribeAlias(callee.object);
  }

  return false;
};
