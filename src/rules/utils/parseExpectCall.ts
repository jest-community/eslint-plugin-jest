import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  AccessorNode,
  KnownMemberExpression,
  getAccessorValue,
  isSupportedAccessor,
} from '../utils';

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
