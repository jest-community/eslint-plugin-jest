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
 *
 * @return {node is ExpectCall}
 */
export const isExpectCall = (node: TSESTree.Node): node is ExpectCall =>
  node.type === AST_NODE_TYPES.CallExpression &&
  isSupportedAccessor(node.callee, 'expect') &&
  node.parent !== undefined;

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

export const parseExpectCall = <ExpectNode extends ExpectCall>(
  expect: ExpectNode,
): Expectation<ExpectNode> => {
  const expectation: Expectation<ExpectNode> = {
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

type JestFunctionName = DescribeAlias | TestCaseName | HookName;
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
 */
export const isTestCaseCall2 = (
  node: TSESTree.CallExpression,
  scope?: TSESLint.Scope.Scope,
): node is JestFunctionCallExpression<TestCaseName> => {
  const name = findFirstCallPropertyName(node, Object.keys(TestCaseProperty));

  if (!!name && TestCaseName.hasOwnProperty(name)) {
    if (!scope) {
      return true;
    }

    return !scopeHasLocalReference(scope, name);
  }

  return false;
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
  scope?: TSESLint.Scope.Scope,
): node is JestFunctionCallExpression<TestCaseName> => {
  let name = findFirstCallPropertyName(node, Object.keys(TestCaseProperty));

  if (!name) {
    return false;
  }

  if (scope && name) {
    name = resolveToJestFn(scope, name);
  }

  console.log(name);

  return !!name && TestCaseName.hasOwnProperty(name);
};

const findFirstCallPropertyName = (
  node: TSESTree.CallExpression,
  properties: string[],
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
  scope?: TSESLint.Scope.Scope,
): node is JestFunctionCallExpression<DescribeAlias> => {
  let name = findFirstCallPropertyName(node, Object.keys(DescribeProperty));

  if (!name) {
    return false;
  }

  if (scope && name) {
    name = resolveToJestFn(scope, name);
  }

  return !!name && DescribeAlias.hasOwnProperty(name);
};

interface ImportDetails {
  source: string;
  local: string;
  imported: string;
}

const describeImportDef = (
  def: TSESLint.Scope.Definitions.ImportBindingDefinition,
): ImportDetails | null => {
  if (def.parent.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
    return null;
  }

  if (def.node.type !== AST_NODE_TYPES.ImportSpecifier) {
    return null;
  }

  return {
    source: def.parent.source.value,
    imported: def.node.imported.name,
    local: def.node.local.name,
  };
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

      if (ref.defs.length > 1) {
        throw new Error('please report this');
      }

      const [def] = ref.defs;

      if (def.type === 'ImportBinding') {
        if (def.parent.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
          continue;
        }

        const details = describeImportDef(def);

        if (details) {
          imports.set(details.local, details);
        }

        continue;
      }

      if (def.type !== 'ImplicitGlobalVariable') {
        locals.add(ref.name);
      }
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
    // referenceName was not found as an unresolved reference,
    // meaning it is likely not an implicit global reference.
    !references.unresolved.has(referenceName)
  );
};

export const resolveToJestFn = (
  scope: TSESLint.Scope.Scope,
  identifier: string,
) => {
  const references = collectReferences(scope);

  // the identifier was found as a local variable or function declaration
  // meaning it's not a function from jest
  if (references.locals.has(identifier)) {
    return null;
  }

  // the identifier was not found as an unresolved reference,
  // meaning it's unlikely to be an implicit global variable
  if (!references.unresolved.has(identifier)) {
    return null;
  }

  const maybeImport = references.imports.get(identifier);

  if (maybeImport) {
    // the identifier is imported from @jest/globals,
    // so return the original import name
    if (maybeImport.source === '@jest/globals') {
      return maybeImport.imported;
    }

    return null;
  }

  return identifier;
};
