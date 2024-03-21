import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  type AccessorNode,
  DescribeAlias,
  HookName,
  type KnownMemberExpression,
  ModifierName,
  TestCaseName,
  findTopMostCallExpression,
  getAccessorValue,
  getScope,
  getStringValue,
  isIdentifier,
  isStringNode,
  isSupportedAccessor,
} from '../utils';

export const isTypeOfJestFnCall = (
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
  types: JestFnType[],
): boolean => {
  const jestFnCall = parseJestFnCall(node, context);

  return jestFnCall !== null && types.includes(jestFnCall.type);
};

const joinChains = (
  a: AccessorNode[] | null,
  b: AccessorNode[] | null,
): AccessorNode[] | null => (a && b ? [...a, ...b] : null);

export function getNodeChain(node: TSESTree.Node): AccessorNode[] | null {
  if (isSupportedAccessor(node)) {
    return [node];
  }

  switch (node.type) {
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return getNodeChain(node.tag);
    case AST_NODE_TYPES.MemberExpression:
      return joinChains(getNodeChain(node.object), getNodeChain(node.property));
    case AST_NODE_TYPES.CallExpression:
      return getNodeChain(node.callee);
  }

  return null;
}

export interface ResolvedJestFnWithNode extends ResolvedJestFn {
  node: AccessorNode;
}

export type JestFnType =
  | 'hook'
  | 'describe'
  | 'test'
  | 'expect'
  | 'jest'
  | 'unknown';

const determineJestFnType = (name: string): JestFnType => {
  if (name === 'expect') {
    return 'expect';
  }

  if (name === 'jest') {
    return 'jest';
  }

  if (DescribeAlias.hasOwnProperty(name)) {
    return 'describe';
  }

  if (TestCaseName.hasOwnProperty(name)) {
    return 'test';
  }

  /* istanbul ignore else */
  if (HookName.hasOwnProperty(name)) {
    return 'hook';
  }

  /* istanbul ignore next */
  return 'unknown';
};

interface BaseParsedJestFnCall {
  /**
   * The name of the underlying Jest function that is being called.
   * This is the result of `(head.original ?? head.local)`.
   */
  name: string;
  type: JestFnType;
  head: ResolvedJestFnWithNode;
  members: KnownMemberExpressionProperty[];
}

interface ParsedGeneralJestFnCall extends BaseParsedJestFnCall {
  type: Exclude<JestFnType, 'expect'>;
}

export interface ParsedExpectFnCall
  extends BaseParsedJestFnCall,
    ModifiersAndMatcher {
  type: 'expect';
}

export type ParsedJestFnCall = ParsedGeneralJestFnCall | ParsedExpectFnCall;

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
  'xdescribe',
  'xdescribe.each',
  'it',
  'it.concurrent',
  'it.concurrent.failing',
  'it.concurrent.each',
  'it.concurrent.failing.each',
  'it.concurrent.failing.only.each',
  'it.concurrent.failing.skip.each',
  'it.concurrent.only.each',
  'it.concurrent.skip.each',
  'it.each',
  'it.failing',
  'it.failing.each',
  'it.only',
  'it.only.each',
  'it.only.failing',
  'it.only.failing.each',
  'it.skip',
  'it.skip.each',
  'it.skip.failing',
  'it.skip.failing.each',
  'it.todo',
  'fit',
  'fit.each',
  'fit.failing',
  'fit.failing.each',
  'xit',
  'xit.each',
  'xit.failing',
  'xit.failing.each',
  'test',
  'test.concurrent',
  'test.concurrent.failing',
  'test.concurrent.each',
  'test.concurrent.failing.each',
  'test.concurrent.failing.only.each',
  'test.concurrent.failing.skip.each',
  'test.concurrent.only.each',
  'test.concurrent.skip.each',
  'test.each',
  'test.failing',
  'test.failing.each',
  'test.only',
  'test.only.each',
  'test.only.failing',
  'test.only.failing.each',
  'test.skip',
  'test.skip.each',
  'test.skip.failing',
  'test.skip.failing.each',
  'test.todo',
  'xtest',
  'xtest.each',
  'xtest.failing',
  'xtest.failing.each',
];

// todo: switch back to using declaration merging once https://github.com/typescript-eslint/typescript-eslint/pull/8485
//  is landed
interface SharedConfigurationSettings {
  jest?: {
    globalAliases?: Record<string, string[]>;
    version?: number | string;
  };
}

const resolvePossibleAliasedGlobal = (
  global: string,
  context: TSESLint.RuleContext<string, unknown[]>,
) => {
  const globalAliases =
    (context.settings as SharedConfigurationSettings).jest?.globalAliases ?? {};

  const alias = Object.entries(globalAliases).find(([, aliases]) =>
    aliases.includes(global),
  );

  if (alias) {
    return alias[0];
  }

  return null;
};

const parseJestFnCallCache = new WeakMap<
  TSESTree.CallExpression,
  ParsedJestFnCall | string | null
>();

export const parseJestFnCall = (
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
): ParsedJestFnCall | null => {
  const jestFnCall = parseJestFnCallWithReason(node, context);

  if (typeof jestFnCall === 'string') {
    return null;
  }

  return jestFnCall;
};

export const parseJestFnCallWithReason = (
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
): ParsedJestFnCall | string | null => {
  let parsedJestFnCall = parseJestFnCallCache.get(node);

  if (parsedJestFnCall) {
    return parsedJestFnCall;
  }

  parsedJestFnCall = parseJestFnCallWithReasonInner(node, context);

  parseJestFnCallCache.set(node, parsedJestFnCall);

  return parsedJestFnCall;
};

const parseJestFnCallWithReasonInner = (
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<string, unknown[]>,
): ParsedJestFnCall | string | null => {
  const chain = getNodeChain(node);

  if (!chain?.length) {
    return null;
  }

  const [first, ...rest] = chain;

  const lastLink = getAccessorValue(chain[chain.length - 1]);

  // if we're an `each()`, ensure we're the outer CallExpression (i.e `.each()()`)
  if (lastLink === 'each') {
    if (
      node.callee.type !== AST_NODE_TYPES.CallExpression &&
      node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression
    ) {
      return null;
    }
  }

  if (
    node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression &&
    lastLink !== 'each'
  ) {
    return null;
  }

  const resolved = resolveToJestFn(context, first);

  // we're not a jest function
  if (!resolved) {
    return null;
  }

  const name = resolved.original ?? resolved.local;

  const links = [name, ...rest.map(link => getAccessorValue(link))];

  if (
    name !== 'jest' &&
    name !== 'expect' &&
    !ValidJestFnCallChains.includes(links.join('.'))
  ) {
    return null;
  }

  const parsedJestFnCall: Omit<ParsedJestFnCall, 'type'> = {
    name,
    head: { ...resolved, node: first },
    // every member node must have a member expression as their parent
    // in order to be part of the call chain we're parsing
    members: rest as KnownMemberExpressionProperty[],
  };

  const type = determineJestFnType(name);

  if (type === 'expect') {
    const result = parseJestExpectCall(parsedJestFnCall);

    // if the `expect` call chain is not valid, only report on the topmost node
    // since all members in the chain are likely to get flagged for some reason
    if (
      typeof result === 'string' &&
      findTopMostCallExpression(node) !== node
    ) {
      return null;
    }

    if (result === 'matcher-not-found') {
      if (node.parent?.type === AST_NODE_TYPES.MemberExpression) {
        return 'matcher-not-called';
      }
    }

    return result;
  }

  // check that every link in the chain except the last is a member expression
  if (
    chain
      .slice(0, chain.length - 1)
      .some(nod => nod.parent?.type !== AST_NODE_TYPES.MemberExpression)
  ) {
    return null;
  }

  // ensure that we're at the "top" of the function call chain otherwise when
  // parsing e.g. x().y.z(), we'll incorrectly find & parse "x()" even though
  // the full chain is not a valid jest function call chain
  if (
    node.parent?.type === AST_NODE_TYPES.CallExpression ||
    node.parent?.type === AST_NODE_TYPES.MemberExpression
  ) {
    return null;
  }

  return { ...parsedJestFnCall, type };
};

type KnownMemberExpressionProperty<Specifics extends string = string> =
  AccessorNode<Specifics> & { parent: KnownMemberExpression<Specifics> };

interface ModifiersAndMatcher {
  modifiers: KnownMemberExpressionProperty[];
  matcher: KnownMemberExpressionProperty;
  /** The arguments that are being passed to the `matcher` */
  args: TSESTree.CallExpression['arguments'];
}

const findModifiersAndMatcher = (
  members: KnownMemberExpressionProperty[],
): ModifiersAndMatcher | string => {
  const modifiers: KnownMemberExpressionProperty[] = [];

  for (const member of members) {
    // check if the member is being called, which means it is the matcher
    // (and also the end of the entire "expect" call chain)
    if (
      member.parent?.type === AST_NODE_TYPES.MemberExpression &&
      member.parent.parent?.type === AST_NODE_TYPES.CallExpression
    ) {
      return {
        matcher: member,
        args: member.parent.parent.arguments,
        modifiers,
      };
    }

    // otherwise, it should be a modifier
    const name = getAccessorValue(member);

    if (modifiers.length === 0) {
      // the first modifier can be any of the three modifiers
      if (!ModifierName.hasOwnProperty(name)) {
        return 'modifier-unknown';
      }
    } else if (modifiers.length === 1) {
      // the second modifier can only be "not"
      if (name !== ModifierName.not) {
        return 'modifier-unknown';
      }

      const firstModifier = getAccessorValue(modifiers[0]);

      // and the first modifier has to be either "resolves" or "rejects"
      if (
        firstModifier !== ModifierName.resolves &&
        firstModifier !== ModifierName.rejects
      ) {
        return 'modifier-unknown';
      }
    } else {
      return 'modifier-unknown';
    }

    modifiers.push(member);
  }

  // this will only really happen if there are no members
  return 'matcher-not-found';
};

const parseJestExpectCall = (
  typelessParsedJestFnCall: Omit<ParsedJestFnCall, 'type'>,
): ParsedExpectFnCall | string => {
  const modifiersAndMatcher = findModifiersAndMatcher(
    typelessParsedJestFnCall.members,
  );

  if (typeof modifiersAndMatcher === 'string') {
    return modifiersAndMatcher;
  }

  return {
    ...typelessParsedJestFnCall,
    type: 'expect',
    ...modifiersAndMatcher,
  };
};

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
      return node.argument.source;
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

export const resolveScope = (
  scope: TSESLint.Scope.Scope,
  identifier: string,
): ImportDetails | 'local' | null => {
  let currentScope: TSESLint.Scope.Scope | null = scope;

  while (currentScope !== null) {
    const ref = currentScope.set.get(identifier);

    if (ref && ref.defs.length > 0) {
      const def = ref.defs[ref.defs.length - 1];

      const importDetails = describePossibleImportDef(def);

      if (importDetails?.local === identifier) {
        return importDetails;
      }

      return 'local';
    }

    currentScope = currentScope.upper;
  }

  return null;
};

interface ResolvedJestFn {
  original: string | null;
  local: string;
  type: 'import' | 'global';
}

const resolveToJestFn = (
  context: TSESLint.RuleContext<string, unknown[]>,
  accessor: AccessorNode,
): ResolvedJestFn | null => {
  const identifier = getAccessorValue(accessor);
  const maybeImport = resolveScope(getScope(context, accessor), identifier);

  // the identifier was found as a local variable or function declaration
  // meaning it's not a function from jest
  if (maybeImport === 'local') {
    return null;
  }

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

  return {
    original: resolvePossibleAliasedGlobal(identifier, context),
    local: identifier,
    type: 'global',
  };
};
