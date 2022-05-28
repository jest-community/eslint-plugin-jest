import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  AccessorNode,
  DescribeAlias,
  HookName,
  TestCaseName,
  getAccessorValue,
  getStringValue,
  isIdentifier,
  isStringNode,
  isSupportedAccessor,
} from '../utils';

export const isTypeOfJestFnCall = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
  types: JestFnType[],
): boolean => {
  const parsed = parseJestFnCall(node, scope);

  return parsed !== null && types.includes(parsed.type);
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

export interface ResolvedJestFnWithNode extends ResolvedJestFn {
  node: AccessorNode;
}

type JestFnType = 'hook' | 'describe' | 'test' | 'expect' | 'jest' | 'unknown';

const determineJestFnType = (name: string): JestFnType => {
  // if (name === 'expect') {
  //   return 'expect';
  // }

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

export interface ParsedJestFnCall {
  /**
   * The name of the underlying Jest function that is being called.
   * This is the result of `(head.original ?? head.local)`.
   */
  name: string;
  type: JestFnType;
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
  'it.skip',
  'it.skip.each',
  'it.todo',
  'fit',
  'fit.each',
  'xit',
  'xit.each',
  'test',
  'test.concurrent',
  'test.concurrent.each',
  'test.concurrent.only.each',
  'test.concurrent.skip.each',
  'test.each',
  'test.only',
  'test.only.each',
  'test.skip',
  'test.skip.each',
  'test.todo',
  'xtest',
  'xtest.each',

  // todo: check if actually valid (not in docs)
  'test.concurrent.skip',
  'test.concurrent.only',
  'it.concurrent.skip',
  'it.concurrent.only',
];

export const parseJestFnCall = (
  node: TSESTree.CallExpression,
  scope: TSESLint.Scope.Scope,
): ParsedJestFnCall | null => {
  // ensure that we're at the "top" of the function call chain otherwise when
  // parsing e.g. x().y.z(), we'll incorrectly find & parse "x()" even though
  // the full chain is not a valid jest function call chain
  if (
    node.parent?.type === AST_NODE_TYPES.CallExpression ||
    node.parent?.type === AST_NODE_TYPES.MemberExpression
  ) {
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

  const name = resolved.original ?? resolved.local;

  const links = [name, ...rest.map(link => getAccessorValue(link))];

  if (name !== 'jest' && !ValidJestFnCallChains.includes(links.join('.'))) {
    return null;
  }

  return {
    name,
    type: determineJestFnType(name),
    head: { ...resolved, node: first },
    members: rest,
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
