import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import type ts from 'typescript';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

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

function isBuiltinSymbolLike(
  program: ts.Program,
  type: ts.Type,
  symbolName: string,
): boolean {
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

  /* istanbul ignore next */
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

export type MessageIds = 'poorlyExpectedPromise' | 'unneededRejectResolve';

export type Options = [];

export default createRule<Options, MessageIds>({
  name: __filename,
  meta: {
    docs: {
      description:
        'Require that `resolve` and `reject` modifiers are present (and only) for promise-like types',
      requiresTypeChecking: true,
    },
    messages: {
      poorlyExpectedPromise:
        'Subject is a promise so resolve or reject should be used',
      unneededRejectResolve:
        'Subject is not a promise so {{ modifier }} is not needed',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ TypeFlags, SymbolFlags } = require('typescript'));

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (
          jestFnCall?.type !== 'expect' ||
          jestFnCall.head.node.parent.type !== AST_NODE_TYPES.CallExpression
        ) {
          return;
        }

        const [argument] = jestFnCall.head.node.parent.arguments;

        const isPromiseLike = isBuiltinSymbolLike(
          services.program,
          services.getTypeAtLocation(argument),
          'Promise',
        );

        const promiseModifier = jestFnCall.modifiers.find(
          nod => getAccessorValue(nod) !== 'not',
        );

        if (isPromiseLike && !promiseModifier) {
          context.report({
            messageId: 'poorlyExpectedPromise',
            node,
          });

          return;
        }

        if (!isPromiseLike && promiseModifier) {
          context.report({
            messageId: 'unneededRejectResolve',
            data: { modifier: getAccessorValue(promiseModifier) },
            node: promiseModifier,
          });
        }
      },
    };
  },
});
