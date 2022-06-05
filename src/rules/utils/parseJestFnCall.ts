import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  AccessorNode,
  DescribeAlias,
  HookName,
  ModifierName,
  TestCaseName,
  getAccessorValue,
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

type JestFnType = 'hook' | 'describe' | 'test' | 'expect' | 'jest' | 'unknown';

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
  members: AccessorNode[];
}

interface ParsedGeneralJestFnCall extends BaseParsedJestFnCall {
  type: Exclude<JestFnType, 'expect'>;
}

interface ParsedExpectFnCall extends BaseParsedJestFnCall {
  type: 'expect';
  args: TSESTree.CallExpression['arguments'];
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
  'it.concurrent.each',
  'it.concurrent.only.each',
  'it.concurrent.skip.each',
  'it.each',
  'it.failing',
  'it.only',
  'it.only.each',
  'it.only.failing',
  'it.skip',
  'it.skip.each',
  'it.skip.failing',
  'it.todo',
  'fit',
  'fit.each',
  'fit.failing',
  'xit',
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
  'xtest.failing',
];

declare module '@typescript-eslint/utils/dist/ts-eslint' {
  export interface SharedConfigurationSettings {
    jest?: {
      globalAliases?: Record<string, string[]>;
      version?: number | string;
    };
  }
}

const resolvePossibleAliasedGlobal = (
  global: string,
  context: TSESLint.RuleContext<string, unknown[]>,
) => {
  const globalAliases = context.settings.jest?.globalAliases ?? {};

  const alias = Object.entries(globalAliases).find(([, aliases]) =>
    aliases.includes(global),
  );

  if (alias) {
    return alias[0];
  }

  return null;
};

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
  // ensure that we're at the "top" of the function call chain otherwise when
  // parsing e.g. x().y.z(), we'll incorrectly find & parse "x()" even though
  // the full chain is not a valid jest function call chain
  // if (
  //   node.parent?.type === AST_NODE_TYPES.CallExpression ||
  //   node.parent?.type === AST_NODE_TYPES.MemberExpression
  // ) {
  //   return null;
  // }

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

  const resolved = resolveToJestFn(context, getAccessorValue(first));

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
    members: rest,
  };

  const type = determineJestFnType(name);

  // if (
  //   node.parent?.type === AST_NODE_TYPES.CallExpression
  //   // node.parent?.type === AST_NODE_TYPES.MemberExpression
  // ) {
  //   return null;
  // }

  if (type === 'expect') {
    // const findTopMostMemberExpression = (
    //   node: TSESTree.MemberExpression,
    // ): TSESTree.MemberExpression => {
    //   let topMostMemberExpression = node;
    //   let { parent } = node;
    //
    //   while (parent) {
    //     if (parent.type !== AST_NODE_TYPES.MemberExpression) {
    //       break;
    //     }
    //
    //     topMostMemberExpression = parent;
    //     parent = parent.parent;
    //   }
    //
    //   return topMostMemberExpression;
    // };
    const findTopMostCallExpression = (
      node: TSESTree.CallExpression,
    ): TSESTree.CallExpression => {
      let topMostCallExpression = node;
      let { parent } = node;

      while (parent) {
        if (parent.type === AST_NODE_TYPES.CallExpression) {
          topMostCallExpression = parent;

          parent = parent.parent;

          continue;
        }

        if (parent.type !== AST_NODE_TYPES.MemberExpression) {
          break;
        }

        parent = parent.parent;
      }

      return topMostCallExpression;
    };

    const result = parseJestExpectCall(parsedJestFnCall);

    const topMost = findTopMostCallExpression(node);

    // if (topMost !== node) {
    //   return null;
    // }

    // console.log(
    //   typeof result,
    //   'topmost',
    //   topMost === node,
    //   parsedJestFnCall.members.length,
    // );
    if (typeof result === 'string' && topMost !== node) {
      return null;
    }
    // console.log(result);

    // if (typeof result !== 'string') {
    //   if (
    //     node.parent?.type === AST_NODE_TYPES.CallExpression ||
    //     node.parent?.type === AST_NODE_TYPES.MemberExpression
    //   ) {
    //     return null;
    //   }
    // }

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

// type ReasonWhyNotJestFn = '';

// interface NodeWithParent<TParent extends TSESTree.Node> extends TSESTree.Node {
type NodeWithParent<
  TNode extends TSESTree.Node,
  TParent extends TSESTree.Node,
> = TNode & { parent: TParent };

interface ModifiersAndMatcher {
  modifiers: AccessorNode[];
  matcher: AccessorNode;
  matcherArgs: TSESTree.CallExpression['arguments'];
}

const findModifiersAndMatcher = (
  members: AccessorNode[],
): ModifiersAndMatcher | string => {
  const modifiers: AccessorNode[] = [];

  if (members.length === 0) {
    return 'matcher-not-found';
  }

  for (const member of members) {
    // check if the member is being called, which means it is the matcher
    // (and also the end of the entire "expect" call chain)
    if (
      member.parent?.type === AST_NODE_TYPES.MemberExpression &&
      member.parent.parent?.type === AST_NODE_TYPES.CallExpression
    ) {
      return {
        matcher: member,
        matcherArgs: member.parent.parent.arguments,
        modifiers,
      };
      // return 'matcher-not-called';
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

  return 'matcher-not-called';
};

const parseJestExpectCall = (
  typelessParsedJestFnCall: Omit<ParsedJestFnCall, 'type'>,
): ParsedExpectFnCall | string => {
  // const expectNode = chain[chain.length - 1];
  const [...modifierNodes] = typelessParsedJestFnCall.members;
  const members: AccessorNode[] = [...modifierNodes];

  // if (result === 'matcher-not-found') {
  //   if(members.length === 0) {
  //     if (typelessParsedJestFnCall.head.node.parent?.type === AST_NODE_TYPES.MemberExpression && ) {
  //       return 'matcher-not-called';
  //     }
  //   }
  // }

  const modifiersAndMatcher = findModifiersAndMatcher(
    typelessParsedJestFnCall.members,
  );

  if (typeof modifiersAndMatcher === 'string') {
    return modifiersAndMatcher;
  }

  // // for each member
  //
  // for (const member of typelessParsedJestFnCall.members) {
  //   // check if the member is being called, which means it is the matcher
  //   // (and also the end of the entire "expect" call chain)
  //   if (
  //     member.parent?.type === AST_NODE_TYPES.MemberExpression &&
  //     member.parent.parent?.type === AST_NODE_TYPES.CallExpression
  //   ) {
  //     // this should be the matcher since it's being called
  //     members.push(member);
  //     break;
  //     // return 'matcher-not-called';
  //   }
  //
  //   // otherwise, it should be a modifier
  // }
  // const matcherNode = modifierNodes.pop();
  //
  // if (!matcherNode) {
  //   // console.log('no matcher node');
  //
  //   return 'no-matcher';
  // }
  //
  // // ensure that the matcher node is called
  // if (
  //   matcherNode.parent?.type !== AST_NODE_TYPES.MemberExpression ||
  //   matcherNode.parent?.parent?.type !== AST_NODE_TYPES.CallExpression
  // ) {
  //   // console.log('matcher node not called', getAccessorValue(matcherNode));
  //
  //   return 'matcher-not-called';
  // }
  //
  // console.log('modifiers', modifierNodes.length);
  // switch (modifierNodes.length) {
  //   case 0:
  //     break;
  //   case 1:
  //     if (!ModifierName.hasOwnProperty(getAccessorValue(modifierNodes[0]))) {
  //       return 'modifier-unknown';
  //     }
  //     break;
  //   case 2: {
  //     console.log(getAccessorValue(modifierNodes[1]));
  //     // "not" is the only modifier that can be second in the chain
  //     if (getAccessorValue(modifierNodes[1]) !== ModifierName.not) {
  //       return 'modifier-unknown';
  //     }
  //
  //     const firstModifier = getAccessorValue(modifierNodes[0]);
  //
  //     console.log(firstModifier);
  //
  //     // the first modifier has to be either "resolves" or "rejects"
  //     if (
  //       firstModifier !== ModifierName.resolves &&
  //       firstModifier !== ModifierName.rejects
  //     ) {
  //       return 'modifier-unknown';
  //     }
  //     break;
  //   }
  //   // // expect doesn't support more than two modifiers
  //   // default:
  //   //   return 'modifier-unknown';
  // }
  //
  // // ensure that none of the modifiers are called
  // if (
  //   modifierNodes.some(
  //     nod =>
  //       nod.parent?.type !== AST_NODE_TYPES.MemberExpression ||
  //       nod.parent?.parent?.type === AST_NODE_TYPES.CallExpression,
  //   )
  // ) {
  //   return 'modifier-called';
  // }

  return {
    ...typelessParsedJestFnCall,
    type: 'expect',
    args: modifiersAndMatcher.matcherArgs,
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

interface ResolvedJestFn {
  original: string | null;
  local: string;
  type: 'import' | 'global';
}

const resolveToJestFn = (
  context: TSESLint.RuleContext<string, unknown[]>,
  identifier: string,
): ResolvedJestFn | null => {
  const references = collectReferences(context.getScope());

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
    original: resolvePossibleAliasedGlobal(identifier, context),
    local: identifier,
    type: 'global',
  };
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
