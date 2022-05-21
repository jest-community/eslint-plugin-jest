import { parse as parsePath } from 'path';
import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/utils';
import { version } from '../../package.json';

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

export const createRule = ESLintUtils.RuleCreator(name => {
  const ruleName = parsePath(name).name;

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});

export type MaybeTypeCast<Expression extends TSESTree.Expression> =
  | TSTypeCastExpression<Expression>
  | Expression;

type TSTypeCastExpression<
  Expression extends TSESTree.Expression = TSESTree.Expression,
> = AsExpressionChain<Expression> | TypeAssertionChain<Expression>;

interface AsExpressionChain<
  Expression extends TSESTree.Expression = TSESTree.Expression,
> extends TSESTree.TSAsExpression {
  expression: AsExpressionChain<Expression> | Expression;
}

interface TypeAssertionChain<
  Expression extends TSESTree.Expression = TSESTree.Expression,
> extends TSESTree.TSTypeAssertion {
  expression: TypeAssertionChain<Expression> | Expression;
}

const isTypeCastExpression = <Expression extends TSESTree.Expression>(
  node: MaybeTypeCast<Expression>,
): node is TSTypeCastExpression<Expression> =>
  node.type === AST_NODE_TYPES.TSAsExpression ||
  node.type === AST_NODE_TYPES.TSTypeAssertion;

export const followTypeAssertionChain = <
  Expression extends TSESTree.Expression,
>(
  expression: MaybeTypeCast<Expression>,
): Expression =>
  isTypeCastExpression(expression)
    ? followTypeAssertionChain(expression.expression)
    : expression;

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
interface KnownMemberExpression<Name extends string = string>
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
export interface CalledKnownMemberExpression<Name extends string = string>
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
interface KnownIdentifier<Name extends string> extends TSESTree.Identifier {
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

interface ExpectCall extends TSESTree.CallExpression {
  callee: AccessorNode<'expect'>;
  parent: TSESTree.Node;
}

/**
 * Checks if the given `node` is a valid `ExpectCall`.
 *
 * In order to be an `ExpectCall`, the `node` must:
 *  * be a `CallExpression`,
 *  * have an accessor named 'expect',
 *  * have a `parent`.
 *
 * @param {Node} node
 * @param [scope]
 *
 * @return {node is ExpectCall}
 */
export const isExpectCall = (
  node: TSESTree.Node,
  scope?: TSESLint.Scope.Scope,
): node is ExpectCall => {
  if (
    node.type !== AST_NODE_TYPES.CallExpression ||
    !isSupportedAccessor(node.callee, 'expect')
  ) {
    return false;
  }

  if (scope) {
    const parsed = parseJestFnAdvanced(node, scope);

    return parsed?.type === 'expect';
  }

  return (
    isSupportedAccessor(node.callee, 'expect') && node.parent !== undefined
  );
};

// export const isExpectCall = (node: TSESTree.Node): node is ExpectCall =>
//   node.type === AST_NODE_TYPES.CallExpression &&
//   isSupportedAccessor(node.callee, 'expect') &&
//   node.parent !== undefined;

interface ParsedExpectMember<
  Name extends ExpectPropertyName = ExpectPropertyName,
  Node extends ExpectMember<Name> = ExpectMember<Name>,
> {
  name: Name;
  node: Node;
}

/**
 * Represents a `MemberExpression` that comes after an `ExpectCall`.
 */
interface ExpectMember<
  PropertyName extends ExpectPropertyName = ExpectPropertyName,
> extends KnownMemberExpression<PropertyName> {
  object: ExpectCall | ExpectMember;
  parent: TSESTree.Node;
}

export const isExpectMember = <
  Name extends ExpectPropertyName = ExpectPropertyName,
>(
  node: TSESTree.Node,
  name?: Name,
): node is ExpectMember<Name> =>
  node.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(node.property, name);

/**
 * Represents all the jest matchers.
 */
type MatcherName = string /* & not ModifierName */;
type ExpectPropertyName = ModifierName | MatcherName;

export type ParsedEqualityMatcherCall<
  Argument extends TSESTree.Expression = TSESTree.Expression,
  Matcher extends EqualityMatcher = EqualityMatcher,
> = Omit<ParsedExpectMatcher<Matcher>, 'arguments'> & {
  parent: TSESTree.CallExpression;
  arguments: [Argument];
};

export enum ModifierName {
  not = 'not',
  rejects = 'rejects',
  resolves = 'resolves',
}

export enum EqualityMatcher {
  toBe = 'toBe',
  toEqual = 'toEqual',
  toStrictEqual = 'toStrictEqual',
}

export const isParsedEqualityMatcherCall = <
  MatcherName extends EqualityMatcher = EqualityMatcher,
>(
  matcher: ParsedExpectMatcher,
  name?: MatcherName,
): matcher is ParsedEqualityMatcherCall<TSESTree.Expression, MatcherName> =>
  (name
    ? matcher.name === name
    : EqualityMatcher.hasOwnProperty(matcher.name)) &&
  matcher.arguments !== null &&
  matcher.arguments.length === 1;

/**
 * Represents a parsed expect matcher, such as `toBe`, `toContain`, and so on.
 */
export interface ParsedExpectMatcher<
  Matcher extends MatcherName = MatcherName,
  Node extends ExpectMember<Matcher> = ExpectMember<Matcher>,
> extends ParsedExpectMember<Matcher, Node> {
  /**
   * The arguments being passed to the matcher.
   * A value of `null` means the matcher isn't being called.
   */
  arguments: TSESTree.CallExpression['arguments'] | null;
}

type BaseParsedModifier<Modifier extends ModifierName = ModifierName> =
  ParsedExpectMember<Modifier>;

type NegatableModifierName = ModifierName.rejects | ModifierName.resolves;
type NotNegatableModifierName = ModifierName.not;

/**
 * Represents a parsed modifier that can be followed by a `not` negation modifier.
 */
interface NegatableParsedModifier<
  Modifier extends NegatableModifierName = NegatableModifierName,
> extends BaseParsedModifier<Modifier> {
  negation?: ExpectMember<ModifierName.not>;
}

/**
 * Represents a parsed modifier that cannot be followed by a `not` negation modifier.
 */
export interface NotNegatableParsedModifier<
  Modifier extends NotNegatableModifierName = NotNegatableModifierName,
> extends BaseParsedModifier<Modifier> {
  negation?: never;
}

export type ParsedExpectModifier =
  | NotNegatableParsedModifier
  | NegatableParsedModifier;

interface Expectation<ExpectNode extends ExpectCall = ExpectCall> {
  expect: ExpectNode;
  modifier?: ParsedExpectModifier;
  matcher?: ParsedExpectMatcher;
}

const parseExpectMember = <S extends ExpectPropertyName>(
  expectMember: ExpectMember<S>,
): ParsedExpectMember<S> => ({
  name: getAccessorValue<S>(expectMember.property),
  node: expectMember,
});

const reparseAsMatcher = (
  parsedMember: ParsedExpectMember,
): ParsedExpectMatcher => ({
  ...parsedMember,
  /**
   * The arguments being passed to this `Matcher`, if any.
   *
   * If this matcher isn't called, this will be `null`.
   */
  arguments:
    parsedMember.node.parent.type === AST_NODE_TYPES.CallExpression
      ? parsedMember.node.parent.arguments
      : null,
});

/**
 * Re-parses the given `parsedMember` as a `ParsedExpectModifier`.
 *
 * If the given `parsedMember` does not have a `name` of a valid `Modifier`,
 * an exception will be thrown.
 *
 * @param {ParsedExpectMember<ModifierName>} parsedMember
 *
 * @return {ParsedExpectModifier}
 */
const reparseMemberAsModifier = (
  parsedMember: ParsedExpectMember<ModifierName>,
): ParsedExpectModifier => {
  if (isSpecificMember(parsedMember, ModifierName.not)) {
    return parsedMember;
  }

  /* istanbul ignore if */
  if (
    !isSpecificMember(parsedMember, ModifierName.resolves) &&
    !isSpecificMember(parsedMember, ModifierName.rejects)
  ) {
    // ts doesn't think that the ModifierName.not check is the direct inverse as the above two checks
    // todo: impossible at runtime, but can't be typed w/o negation support
    throw new Error(
      `modifier name must be either "${ModifierName.resolves}" or "${ModifierName.rejects}" (got "${parsedMember.name}")`,
    );
  }

  const negation = isExpectMember(parsedMember.node.parent, ModifierName.not)
    ? parsedMember.node.parent
    : undefined;

  return {
    ...parsedMember,
    negation,
  };
};

const isSpecificMember = <Name extends ExpectPropertyName>(
  member: ParsedExpectMember,
  specific: Name,
): member is ParsedExpectMember<Name> => member.name === specific;

/**
 * Checks if the given `ParsedExpectMember` should be re-parsed as an `ParsedExpectModifier`.
 *
 * @param {ParsedExpectMember} member
 *
 * @return {member is ParsedExpectMember<ModifierName>}
 */
const shouldBeParsedExpectModifier = (
  member: ParsedExpectMember,
): member is ParsedExpectMember<ModifierName> =>
  ModifierName.hasOwnProperty(member.name);

export const parseExpectCall = (
  expect: ExpectCall,
): Expectation<ExpectCall> => {
  const expectation: Expectation<ExpectCall> = {
    expect,
  };

  if (!isExpectMember(expect.parent)) {
    return expectation;
  }

  const parsedMember = parseExpectMember(expect.parent);

  if (!shouldBeParsedExpectModifier(parsedMember)) {
    expectation.matcher = reparseAsMatcher(parsedMember);

    return expectation;
  }

  const modifier = (expectation.modifier =
    reparseMemberAsModifier(parsedMember));

  const memberNode = modifier.negation || modifier.node;

  if (!isExpectMember(memberNode.parent)) {
    return expectation;
  }

  expectation.matcher = reparseAsMatcher(parseExpectMember(memberNode.parent));

  return expectation;
};

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
  'concurrent' = 'concurrent',
  'only' = 'only',
  'skip' = 'skip',
  'todo' = 'todo',
}

type JestFunctionName = DescribeAlias | TestCaseName | HookName | string;
type JestPropertyName = DescribeProperty | TestCaseProperty;

interface JestFunctionIdentifier<FunctionName extends JestFunctionName>
  extends TSESTree.Identifier {
  name: FunctionName;
}

interface JestFunctionMemberExpression<
  FunctionName extends JestFunctionName,
  PropertyName extends JestPropertyName = JestPropertyName,
> extends KnownMemberExpression<PropertyName> {
  object: JestFunctionIdentifier<FunctionName>;
}

interface JestFunctionCallExpressionWithMemberExpressionCallee<
  FunctionName extends JestFunctionName,
  PropertyName extends JestPropertyName = JestPropertyName,
> extends TSESTree.CallExpression {
  callee: JestFunctionMemberExpression<FunctionName, PropertyName>;
}

export interface JestFunctionCallExpressionWithIdentifierCallee<
  FunctionName extends JestFunctionName,
> extends TSESTree.CallExpression {
  callee: JestFunctionIdentifier<FunctionName>;
}

interface JestEachMemberExpression<
  TName extends Exclude<JestFunctionName, HookName>,
> extends KnownMemberExpression<'each'> {
  object:
    | KnownIdentifier<TName>
    | (KnownMemberExpression & { object: KnownIdentifier<TName> });
}

export interface JestCalledEachCallExpression<
  TName extends Exclude<JestFunctionName, HookName>,
> extends TSESTree.CallExpression {
  callee: TSESTree.CallExpression & {
    callee: JestEachMemberExpression<TName>;
  };
}

export interface JestTaggedEachCallExpression<
  TName extends Exclude<JestFunctionName, HookName>,
> extends TSESTree.CallExpression {
  callee: TSESTree.TaggedTemplateExpression & {
    tag: JestEachMemberExpression<TName>;
  };
}

type JestEachCallExpression<TName extends Exclude<JestFunctionName, HookName>> =
  JestCalledEachCallExpression<TName> | JestTaggedEachCallExpression<TName>;

export type JestFunctionCallExpression<
  FunctionName extends Exclude<JestFunctionName, HookName> = Exclude<
    JestFunctionName,
    HookName
  >,
> =
  | JestEachCallExpression<FunctionName>
  | JestFunctionCallExpressionWithMemberExpressionCallee<FunctionName>
  | JestFunctionCallExpressionWithIdentifierCallee<FunctionName>;

const joinNames = (a: string | null, b: string | null): string | null =>
  a && b ? `${a}.${b}` : null;

export function getNodeName(
  node:
    | JestFunctionCallExpression<DescribeAlias | TestCaseName>
    | JestFunctionMemberExpression<JestFunctionName>
    | JestFunctionIdentifier<JestFunctionName>
    | TSESTree.TaggedTemplateExpression,
): string;
export function getNodeName(node: TSESTree.Node): string | null;
export function getNodeName(node: TSESTree.Node): string | null {
  if (isSupportedAccessor(node)) {
    return getAccessorValue(node);
  }

  switch (node.type) {
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return getNodeName(node.tag);
    case AST_NODE_TYPES.MemberExpression:
      return joinNames(getNodeName(node.object), getNodeName(node.property));
    case AST_NODE_TYPES.NewExpression:
    case AST_NODE_TYPES.CallExpression:
      return getNodeName(node.callee);
  }

  return null;
}

export type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export const isFunction = (node: TSESTree.Node): node is FunctionExpression =>
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const isHookCall = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): node is JestFunctionCallExpressionWithIdentifierCallee<HookName> => {
  const parsed = parseJestFnAdvanced(node, scope);

  return parsed?.type === 'hook';
};

export const getTestCallExpressionsFromDeclaredVariables = (
  declaredVariables: readonly TSESLint.Scope.Variable[],
  scope: TSESLint.Scope.Scope,
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
              isTestCaseCall(node, scope),
          ),
      ),
    [],
  );
};

export const isTestCaseCallOriginal = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): node is JestFunctionCallExpression<TestCaseName> => {
  let name = findFirstCallPropertyName(node, Object.keys(TestCaseProperty));

  if (!name) {
    return false;
  }

  const resolved = resolveToJestFn(scope, name);

  if (!resolved) {
    return false;
  }

  name = resolved ? resolved.original ?? resolved.local : null;

  return name !== null && TestCaseName.hasOwnProperty(name);
};

/**
 * Checks if the given `node` is a *call* to a test case function that would
 * result in tests being run by `jest`.
 *
 * Note that `.each()` does not count as a call in this context, as it will not
 * result in `jest` running any tests.
 */
export const isTestCaseCall = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): node is JestFunctionCallExpression<TestCaseName> => {
  // return isTestCaseCallOriginal(node, scope);
  const parsed = parseJestFnAdvanced(node, scope);

  return parsed?.type === 'test';
};

export function getNodeChain(node: TSESTree.Node): AccessorNode[] {
  if (isSupportedAccessor(node)) {
    return [node];
  }

  switch (node.type) {
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return getNodeChain(node.tag);
    case AST_NODE_TYPES.MemberExpression:
      return [...getNodeChain(node.object), ...getNodeChain(node.property)];
    case AST_NODE_TYPES.NewExpression:
    case AST_NODE_TYPES.CallExpression:
      return getNodeChain(node.callee);
  }

  return [];
}

const p = (node: TSESTree.Node): string[] => {
  if (node.parent) {
    return [...p(node.parent), node.type];
  }

  return [node.type];
};

export interface ResolvedJestFnWithNode extends ResolvedJestFn {
  node: AccessorNode;
}

export interface ParsedJestFnCall {
  head: ResolvedJestFnWithNode;
  members: AccessorNode[];
}

const ValidJestFnCallChains = [
  'afterAll',
  'afterEach',
  'beforeAll',
  'beforeEach',
  'describe',
  'describe.each',
  'describe.only',
  'describe.only.each',
  'describe.skip',
  'describe.skip.each',
  'fdescribe',
  'fdescribe.each',
  'fdescribe.each',
  'xdescribe',
  'xdescribe.each',
  'xdescribe.each',
  'it',
  'it.concurrent',
  'it.concurrent.each',
  'it.concurrent.only.each',
  'it.concurrent.skip.each',
  'it.each',
  'it.each',
  'it.failing',
  'it.only',
  'it.only.each',
  'it.only.each',
  'it.only.failing',
  'it.skip',
  'it.skip.each',
  'it.skip.each',
  'it.skip.failing',
  'it.todo',
  'fit',
  'fit.each',
  'fit.each',
  'fit.failing',
  'xit',
  'xit.each',
  'xit.each',
  'xit.failing',
  'test',
  'test.concurrent',
  'test.concurrent.each',
  'test.concurrent.only.each',
  'test.concurrent.skip.each',
  'test.each',
  'test.failing',
  'test.only',
  'test.only.each',
  'test.only.failing',
  'test.skip',
  'test.skip.each',
  'test.skip.failing',
  'test.todo',
  'xtest',
  'xtest.each',
  'xtest.each',
  'xtest.failing',

  // todo: check if actually valid (not in docs)
  'test.concurrent.skip',
  'test.concurrent.only',
  'it.concurrent.skip',
  'it.concurrent.only',
];

export const parseJestFnCall_1 = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): ParsedJestFnCall | null => {
  // ensure that we're at the "top" of the function call chain otherwise when
  // parsing e.g. x().y.z(), we'll incorrectly find & parse "x()"
  if (node.parent?.type !== AST_NODE_TYPES.ExpressionStatement) {
    return null;
  }

  const chain = getNodeChain(node);

  if (chain.length === 0) {
    return null;
  }

  // ensure that the only call expression in the chain is at the end
  if (
    chain
      .slice(0, chain.length - 1)
      .some(nod => nod.parent?.type === AST_NODE_TYPES.CallExpression)
  ) {
    return null;
  }

  const [first, ...rest] = chain;

  const lastNode = chain[chain.length - 1];

  // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
  if (isSupportedAccessor(lastNode, 'each')) {
    if (
      node.callee.type !== AST_NODE_TYPES.CallExpression &&
      node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression
    ) {
      return null;
    }
  }

  const resolved = resolveToJestFn(scope, getAccessorValue(first));

  // we're not a jest function
  if (!resolved) {
    return null;
  }

  const links = [
    resolved.original ?? resolved.local,
    ...rest.map(link => getAccessorValue(link)),
  ];

  if (!ValidJestFnCallChains.includes(links.join('.'))) {
    return null;
  }

  return {
    head: { ...resolved, node: first },
    members: rest,
  };
};

/*
  "parse jest function call"

  1. parse the function call chain
  2. resolve scope of left-most identifier

  checks to perform:
    "things"
 */

const parseJestFnCallChainInner = (
  node: TSESTree.CallExpression,
  properties: readonly string[],
): AccessorNode[] | null => {
  const chain = getNodeChain(node);

  // console.log(getAccessorValue(chain[0]), chain.length);

  // "each" is only valid at the last member of the call chain,
  // or if there are any call expressions in the chain aside
  if (
    chain
      .slice(0, chain.length - 1)
      .some(
        nod =>
          nod.parent?.type === AST_NODE_TYPES.CallExpression ||
          isSupportedAccessor(nod, 'each'),
      )
  ) {
    return null;
  }

  // if the chain contains any members that don't match any of the given properties,
  // we're not a valid jest function call chain
  if (chain.slice(1).some(nod => !properties.includes(getAccessorValue(nod)))) {
    return null;
  }

  const lastNode = chain[chain.length - 1];

  console.log(
    getAccessorValue(chain[0]),
    chain.length,
    p(lastNode).join(' > '),
  );
  // if (lastNode.parent?.parent?.parent?.type === AST_NODE_TYPES.CallExpression) {
  //   return null;
  // }

  console.log(isSupportedAccessor(lastNode, 'each'));
  // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
  if (isSupportedAccessor(lastNode, 'each')) {
    if (
      node.callee.type !== AST_NODE_TYPES.CallExpression &&
      node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression
    ) {
      return null;
    }
  }

  return chain;
};

export const parseJestFnCallChain3 = (
  node: TSESTree.CallExpression,
  properties: readonly string[],
): AccessorNode[] | null => {
  const chain = getNodeChain(node);

  // console.log(getAccessorValue(chain[0]), chain.length);

  if (
    chain
      .slice(0, chain.length - 1)
      .some(
        nod =>
          nod.parent?.type === AST_NODE_TYPES.CallExpression ||
          isSupportedAccessor(nod, 'each'),
      )
  ) {
    return null;
  }

  const lastNode = chain[chain.length - 1];

  console.log(
    getAccessorValue(chain[0]),
    chain.length,
    p(lastNode).join(' > '),
  );
  // if (lastNode.parent?.parent?.parent?.type === AST_NODE_TYPES.CallExpression) {
  //   return null;
  // }

  console.log(isSupportedAccessor(lastNode, 'each'));
  // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
  if (isSupportedAccessor(lastNode, 'each')) {
    if (
      node.callee.type !== AST_NODE_TYPES.CallExpression &&
      node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression
    ) {
      return null;
    }
  }

  // the first element in the chain should be one of x
  // the second element in the chain should be one of y

  return chain;
};

interface ParsedJestFnCallChain {
  subject: TSESTree.Identifier;
  modifier?: AccessorNode;
  each?: AccessorNode;
}

export const parseJestFnCallChain2 = (
  node: TSESTree.CallExpression,
  properties: readonly string[],
): ParsedJestFnCallChain | null => {
  if (isIdentifier(node.callee)) {
    return { subject: node.callee };
  }

  const parsedChain: Omit<ParsedJestFnCallChain, 'subject'> = {};

  const callee =
    node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
      ? node.callee.tag
      : node.callee.type === AST_NODE_TYPES.CallExpression
      ? node.callee.callee
      : node.callee;

  if (
    callee.type !== AST_NODE_TYPES.MemberExpression ||
    !isSupportedAccessor(callee.property)
  ) {
    return null;
  }

  const value = getAccessorValue(callee.property);

  if (!properties.includes(value)) {
    return null;
  }

  if (isIdentifier(callee.object)) {
    if (value === 'each') {
      // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
      if (
        node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression &&
        node.callee.type !== AST_NODE_TYPES.CallExpression
      ) {
        return null;
      }

      return {
        subject: callee.object,
        each: callee.property,
      };
    }

    return {
      subject: callee.object,
      modifier: callee.property,
    };
  }

  // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
  if (
    value === 'each' &&
    node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression &&
    node.callee.type !== AST_NODE_TYPES.CallExpression
  ) {
    return null;
  }

  let value2 = null;

  if (callee.object.type === AST_NODE_TYPES.MemberExpression) {
    if (!isSupportedAccessor(callee.object.property)) {
      return null;
    }

    value2 = getAccessorValue(callee.object.property);

    if (!properties.includes(value2) || value2 === 'each') {
      return null;
    }
  }

  const nod =
    callee.object.type === AST_NODE_TYPES.MemberExpression
      ? callee.object.object
      : callee.object;

  if (isSupportedAccessor(nod)) {
    if (value2) {
      return [getAccessorValue(nod), value2, value];
    }

    return [getAccessorValue(nod), value];
  }

  return null;
};

const parseJestFnCallChain = (
  node: TSESTree.CallExpression,
  properties: readonly string[],
):
  | [name: string, property?: string]
  | [name: string, property?: string, each?: string]
  | null => {
  if (isIdentifier(node.callee)) {
    return [node.callee.name];
  }

  const callee =
    node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
      ? node.callee.tag
      : node.callee.type === AST_NODE_TYPES.CallExpression
      ? node.callee.callee
      : node.callee;

  if (
    callee.type !== AST_NODE_TYPES.MemberExpression ||
    !isSupportedAccessor(callee.property)
  ) {
    return null;
  }

  const value = getAccessorValue(callee.property);

  if (!properties.includes(value)) {
    return null;
  }

  // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
  if (
    value === 'each' &&
    node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression &&
    node.callee.type !== AST_NODE_TYPES.CallExpression
  ) {
    return null;
  }

  let value2 = null;

  if (callee.object.type === AST_NODE_TYPES.MemberExpression) {
    if (!isSupportedAccessor(callee.object.property)) {
      return null;
    }

    value2 = getAccessorValue(callee.object.property);

    if (!properties.includes(value2) || value2 === 'each') {
      return null;
    }
  }

  const nod =
    callee.object.type === AST_NODE_TYPES.MemberExpression
      ? callee.object.object
      : callee.object;

  if (isSupportedAccessor(nod)) {
    if (value2) {
      return [getAccessorValue(nod), value2, value];
    }

    return [getAccessorValue(nod), value];
  }

  return null;
};

const findFirstCallPropertyName = (
  node: TSESTree.CallExpression,
  properties: readonly string[],
): string | null => {
  if (isIdentifier(node.callee)) {
    return node.callee.name;
  }

  const callee =
    node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
      ? node.callee.tag
      : node.callee.type === AST_NODE_TYPES.CallExpression
      ? node.callee.callee
      : node.callee;

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    isSupportedAccessor(callee.property) &&
    properties.includes(getAccessorValue(callee.property))
  ) {
    // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
    if (
      getAccessorValue(callee.property) === 'each' &&
      node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression &&
      node.callee.type !== AST_NODE_TYPES.CallExpression
    ) {
      return null;
    }

    if (callee.object.type === AST_NODE_TYPES.MemberExpression) {
      if (
        !isSupportedAccessor(callee.object.property) ||
        !properties.includes(getAccessorValue(callee.object.property)) ||
        getAccessorValue(callee.object.property) === 'each'
      ) {
        return null;
      }
    }

    const nod =
      callee.object.type === AST_NODE_TYPES.MemberExpression
        ? callee.object.object
        : callee.object;

    if (isSupportedAccessor(nod)) {
      return getAccessorValue(nod);
    }
  }

  return null;
};

/**
 * Checks if the given `node` is a *call* to a `describe` function that would
 * result in a `describe` block being created by `jest`.
 *
 * Note that `.each()` does not count as a call in this context, as it will not
 * result in `jest` creating any `describe` blocks.
 */
export const isDescribeCall = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): node is JestFunctionCallExpression<DescribeAlias> => {
  const parsed = parseJestFnAdvanced(node, scope);

  return parsed?.type === 'describe';
};

interface ParsedJestDescribeFn {
  name: DescribeAlias;
  node: JestFunctionCallExpression<string>;
  imported: boolean;
  type: 'describe';
}

interface ParsedJestTestFn {
  name: TestCaseName;
  node: JestFunctionCallExpression<string>;
  imported: boolean;
  type: 'test';
}

interface ParsedJestHookFn {
  name: HookName;
  node: JestFunctionCallExpressionWithIdentifierCallee<string>;
  imported: boolean;
  type: 'hook';
}

interface ParsedJestExpectFn {
  name: 'expect';
  node: ExpectCall;
  imported: boolean;
  type: 'expect';
}

interface ParsedRawJestFn {
  name: string;
  node: TSESTree.Node;
  imported: boolean;
}

type ParsedJestFn =
  | ParsedJestDescribeFn
  | ParsedJestTestFn
  | ParsedJestHookFn
  | ParsedJestExpectFn;

const getLeftMostIdentifier = (
  call: TSESTree.CallExpression,
): TSESTree.Identifier | null => {
  let node: TSESTree.Node =
    call.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
      ? call.callee.tag
      : call.callee.type === AST_NODE_TYPES.CallExpression
      ? call.callee.callee
      : call.callee;

  while (node) {
    if (node.type !== AST_NODE_TYPES.MemberExpression) {
      break;
    }

    node = node.object;
  }

  if (isIdentifier(node)) {
    return node;
  }

  return null;
};

/**
 * Checks if the given `node` is a *call* to a `describe` function that would
 * result in a `describe` block being created by `jest`.
 *
 * Note that `.each()` does not count as a call in this context, as it will not
 * result in `jest` creating any `describe` blocks.
 */
export const parseJestFnRaw = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): ParsedRawJestFn | null => {
  const leftMostIdentifier = getLeftMostIdentifier(node);

  const first = leftMostIdentifier?.name;
  // const [first] = getNodeName(node)?.split('.') ?? [];

  if (!first) {
    return null;
  }

  const resolved = resolveToJestFn(scope, first);

  if (!resolved) {
    return null;
  }

  return {
    imported: resolved.type === 'import',
    name: resolved.original ?? resolved.local,
    node,
  };
};

/**
 * Checks if the given `node` is a *call* to a `describe` function that would
 * result in a `describe` block being created by `jest`.
 *
 * Note that `.each()` does not count as a call in this context, as it will not
 * result in `jest` creating any `describe` blocks.
 */
export const parseJestFnAdvanced = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): ParsedJestFn | null => {
  const raw = parseJestFnRaw(node, scope);

  if (!raw) {
    return null;
  }

  if (DescribeAlias.hasOwnProperty(raw.name)) {
    // const chain = parseJestFnCallChain(node, Object.keys(DescribeProperty));
    //
    // if (!chain) {
    //   return null;
    // }
    //
    // // const [localName, ]
    //
    // console.log(chain);
    //
    // // original import identifier
    // // local identifier
    // // chain identifiers
    // // has each?
    // // middle member
    const name = findFirstCallPropertyName(node, Object.keys(DescribeProperty));

    if (!name) {
      return null;
    }

    return { ...raw, type: 'describe' } as ParsedJestDescribeFn;
  }

  if (TestCaseName.hasOwnProperty(raw.name)) {
    const name = findFirstCallPropertyName(node, Object.keys(TestCaseProperty));

    if (!name) {
      return null;
    }

    return { ...raw, type: 'test' } as ParsedJestTestFn;
  }

  if (HookName.hasOwnProperty(raw.name)) {
    const name = findFirstCallPropertyName(node, []);

    if (!name) {
      return null;
    }

    return { ...raw, type: 'hook' } as ParsedJestHookFn;
  }

  if (raw.name === 'expect') {
    return { ...raw, type: 'expect' } as ParsedJestExpectFn;
  }

  return null;
};

// /**
//  * Checks if the given `node` is a *call* to a `describe` function that would
//  * result in a `describe` block being created by `jest`.
//  *
//  * Note that `.each()` does not count as a call in this context, as it will not
//  * result in `jest` creating any `describe` blocks.
//  */
// export const parseJestFn = (
//   node: TSESTree.CallExpression,
//   scope: TSESLint.Scope.Scope,
// ): node is JestFunctionCallExpression<DescribeAlias> => {
//   const [first, ...rest] = getNodeName(node)?.split('.') ?? [];
//
//   if (!first) {
//     return false;
//   }
//
//   const resolved = resolveToJestFn(scope, first);
//
//   if (!resolved) {
//     return false;
//   }
//
//   name = resolved ? resolved.original ?? resolved.local : null;
//
//   let name = findFirstCallPropertyName(node, Object.keys(DescribeProperty));
//
//   if (!name) {
//     return false;
//   }
//
//   const resolved = resolveToJestFn(scope, name);
//
//   if (!resolved) {
//     return false;
//   }
//
//   name = resolved ? resolved.original ?? resolved.local : null;
//
//   return name !== null && DescribeAlias.hasOwnProperty(name);
// };

interface ImportDetails {
  source: string;
  local: string;
  imported: string;
}

const describeImportDefAsImport = (
  def: TSESLint.Scope.Definitions.ImportBindingDefinition,
): ImportDetails | null => {
  if (def.parent.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
    return null;
  }

  if (def.node.type !== AST_NODE_TYPES.ImportSpecifier) {
    return null;
  }

  // we only care about value imports
  if (def.parent.importKind === 'type') {
    return null;
  }

  return {
    source: def.parent.source.value,
    imported: def.node.imported.name,
    local: def.node.local.name,
  };
};

/**
 * Attempts to find the node that represents the import source for the
 * given expression node, if it looks like it's an import.
 *
 * If no such node can be found (e.g. because the expression doesn't look
 * like an import), then `null` is returned instead.
 */
const findImportSourceNode = (
  node: TSESTree.Expression,
): TSESTree.Node | null => {
  if (node.type === AST_NODE_TYPES.AwaitExpression) {
    if (node.argument.type === AST_NODE_TYPES.ImportExpression) {
      return (node.argument as TSESTree.ImportExpression).source;
    }

    return null;
  }

  if (
    node.type === AST_NODE_TYPES.CallExpression &&
    isIdentifier(node.callee, 'require')
  ) {
    return node.arguments[0] ?? null;
  }

  return null;
};

const describeVariableDefAsImport = (
  def: TSESLint.Scope.Definitions.VariableDefinition,
): ImportDetails | null => {
  // make sure that we've actually being assigned a value
  if (!def.node.init) {
    return null;
  }

  const sourceNode = findImportSourceNode(def.node.init);

  if (!sourceNode || !isStringNode(sourceNode)) {
    return null;
  }

  if (def.name.parent?.type !== AST_NODE_TYPES.Property) {
    return null;
  }

  if (!isSupportedAccessor(def.name.parent.key)) {
    return null;
  }

  return {
    source: getStringValue(sourceNode),
    imported: getAccessorValue(def.name.parent.key),
    local: def.name.name,
  };
};

/**
 * Attempts to describe a definition as an import if possible.
 *
 * If the definition is an import binding, it's described as you'd expect.
 * If the definition is a variable, then we try and determine if it's either
 * a dynamic `import()` or otherwise a call to `require()`.
 *
 * If it's neither of these, `null` is returned to indicate that the definition
 * is not describable as an import of any kind.
 */
const describePossibleImportDef = (def: TSESLint.Scope.Definition) => {
  if (def.type === 'Variable') {
    return describeVariableDefAsImport(def);
  }

  if (def.type === 'ImportBinding') {
    return describeImportDefAsImport(def);
  }

  return null;
};

const collectReferences = (scope: TSESLint.Scope.Scope) => {
  const locals = new Set();
  const imports = new Map<string, ImportDetails>();
  const unresolved = new Set();

  let currentScope: TSESLint.Scope.Scope | null = scope;

  while (currentScope !== null) {
    for (const ref of currentScope.variables) {
      if (ref.defs.length === 0) {
        continue;
      }

      const def = ref.defs[ref.defs.length - 1];

      const importDetails = describePossibleImportDef(def);

      if (importDetails) {
        imports.set(importDetails.local, importDetails);

        continue;
      }

      locals.add(ref.name);
    }

    for (const ref of currentScope.through) {
      unresolved.add(ref.identifier.name);
    }

    currentScope = currentScope.upper;
  }

  return { locals, imports, unresolved };
};

export const scopeHasLocalReference = (
  scope: TSESLint.Scope.Scope,
  referenceName: string,
) => {
  const references = collectReferences(scope);

  return (
    // referenceName was found as a local variable or function declaration.
    references.locals.has(referenceName) ||
    // referenceName was found as an imported identifier
    references.imports.has(referenceName) ||
    // referenceName was not found as an unresolved reference,
    // meaning it is likely not an implicit global reference.
    !references.unresolved.has(referenceName)
  );
};

// interface ResolvedJestFn {
//   name: string;
//   type: string;
//   imported: boolean;
// }

interface ResolvedJestFn {
  original: string | null;
  local: string;
  type: 'import' | 'global';
}

const resolveToJestFn = (
  scope: TSESLint.Scope.Scope,
  identifier: string,
): ResolvedJestFn | null => {
  const references = collectReferences(scope);

  const maybeImport = references.imports.get(identifier);

  if (maybeImport) {
    // the identifier is imported from @jest/globals,
    // so return the original import name
    if (maybeImport.source === '@jest/globals') {
      return {
        original: maybeImport.imported,
        local: maybeImport.local,
        type: 'import',
      };
    }

    return null;
  }

  // the identifier was found as a local variable or function declaration
  // meaning it's not a function from jest
  if (references.locals.has(identifier)) {
    return null;
  }

  return {
    original: null,
    local: identifier,
    type: 'global',
  };
};
