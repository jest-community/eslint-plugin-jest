import type ts from 'typescript';

let SymbolFlags: typeof ts.SymbolFlags;
let TypeFlags: typeof ts.TypeFlags;

function isSymbolFromDefaultLibrary(
  program: ts.Program,
  symbol: ts.Symbol,
): boolean {
  /* istanbul ignore next */
  const declarations = symbol.getDeclarations() ?? [];

  for (const declaration of declarations) {
    const sourceFile = declaration.getSourceFile();

    /* istanbul ignore else */
    if (program.isSourceFileDefaultLibrary(sourceFile)) {
      return true;
    }
  }

  /* istanbul ignore next */
  return false;
}

export function isBuiltinSymbolLike(
  program: ts.Program,
  type: ts.Type,
  symbolName: string,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ({ TypeFlags, SymbolFlags } = require('typescript'));

  return isBuiltinSymbolLikeRecurser(program, type, subType => {
    const symbol = subType.getSymbol();

    if (!symbol) {
      return false;
    }

    const actualSymbolName = symbol.getName();

    if (
      actualSymbolName === symbolName &&
      isSymbolFromDefaultLibrary(program, symbol)
    ) {
      return true;
    }

    return null;
  });
}

function isBuiltinSymbolLikeRecurser(
  program: ts.Program,
  type: ts.Type,
  predicate: (subType: ts.Type) => boolean | null,
): boolean {
  if (type.isIntersection()) {
    return type.types.some(t =>
      isBuiltinSymbolLikeRecurser(program, t, predicate),
    );
  }
  if (type.isUnion()) {
    return type.types.every(t =>
      isBuiltinSymbolLikeRecurser(program, t, predicate),
    );
  }
  if (isTypeParameter(type)) {
    const t = type.getConstraint();

    if (t) {
      return isBuiltinSymbolLikeRecurser(program, t, predicate);
    }

    return false;
  }

  const predicateResult = predicate(type);

  if (typeof predicateResult === 'boolean') {
    return predicateResult;
  }

  const symbol = type.getSymbol();

  if (symbol && symbol.flags & (SymbolFlags.Class | SymbolFlags.Interface)) {
    const checker = program.getTypeChecker();

    for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
      if (isBuiltinSymbolLikeRecurser(program, baseType, predicate)) {
        return true;
      }
    }
  }

  return false;
}

function isTypeParameter(type: ts.Type): boolean {
  return (type.flags & TypeFlags.TypeParameter) !== 0;
}
