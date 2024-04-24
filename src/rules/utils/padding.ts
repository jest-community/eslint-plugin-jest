/**
 * Require/fix newlines around jest functions
 *
 * Based on eslint/padding-line-between-statements by Toru Nagashima
 * See: https://github.com/eslint/eslint/blob/master/lib/rules/padding-line-between-statements.js
 *
 * Some helpers borrowed from eslint ast-utils by Gyandeep Singh
 * See: https://github.com/eslint/eslint/blob/master/lib/rules/utils/ast-utils.js
 */

import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as astUtils from './ast-utils';
import { createRule } from './misc';

// Statement types we'll respond to
export const enum StatementType {
  Any,
  AfterAllToken,
  AfterEachToken,
  BeforeAllToken,
  BeforeEachToken,
  DescribeToken,
  ExpectToken,
  FdescribeToken,
  FitToken,
  ItToken,
  TestToken,
  XdescribeToken,
  XitToken,
  XtestToken,
}

type StatementTypes = StatementType | StatementType[];

type StatementTester = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
) => boolean;

// Padding type to apply between statements
export const enum PaddingType {
  Any,
  Always,
}

// A configuration object for padding type and the two statement types
interface Config {
  paddingType: PaddingType;
  prevStatementType: StatementTypes;
  nextStatementType: StatementTypes;
}

interface ScopeInfo {
  prevNode: TSESTree.Node | null;
  enter: () => void;
  exit: () => void;
}

interface PaddingContext {
  ruleContext: TSESLint.RuleContext<string, unknown[]>;
  sourceCode: TSESLint.SourceCode;
  scopeInfo: ScopeInfo;
  configs: Config[];
}

type PaddingTester = (
  prevNode: TSESTree.Node,
  nextNode: TSESTree.Node,
  paddingContext: PaddingContext,
) => void;

// Tracks position in scope and prevNode. Used to compare current and prev node
// and then to walk back up to the parent scope or down into the next one.
// And so on...
interface Scope {
  upper: Scope | null;
  prevNode: TSESTree.Node | null;
}

// Creates a StatementTester to test an ExpressionStatement's first token name
const createTokenTester = (tokenName: string): StatementTester => {
  return (node: TSESTree.Node, sourceCode: TSESLint.SourceCode): boolean => {
    let activeNode = node;

    if (activeNode.type === AST_NODE_TYPES.ExpressionStatement) {
      // In the case of `await`, we actually care about its argument
      if (activeNode.expression.type === AST_NODE_TYPES.AwaitExpression) {
        activeNode = activeNode.expression.argument;
      }

      const token = sourceCode.getFirstToken(activeNode);

      return (
        token.type === AST_TOKEN_TYPES.Identifier && token.value === tokenName
      );
    }

    return false;
  };
};

// A mapping of StatementType to StatementTester for... testing statements
const statementTesters: { [T in StatementType]: StatementTester } = {
  [StatementType.Any]: () => true,
  [StatementType.AfterAllToken]: createTokenTester('afterAll'),
  [StatementType.AfterEachToken]: createTokenTester('afterEach'),
  [StatementType.BeforeAllToken]: createTokenTester('beforeAll'),
  [StatementType.BeforeEachToken]: createTokenTester('beforeEach'),
  [StatementType.DescribeToken]: createTokenTester('describe'),
  [StatementType.ExpectToken]: createTokenTester('expect'),
  [StatementType.FdescribeToken]: createTokenTester('fdescribe'),
  [StatementType.FitToken]: createTokenTester('fit'),
  [StatementType.ItToken]: createTokenTester('it'),
  [StatementType.TestToken]: createTokenTester('test'),
  [StatementType.XdescribeToken]: createTokenTester('xdescribe'),
  [StatementType.XitToken]: createTokenTester('xit'),
  [StatementType.XtestToken]: createTokenTester('xtest'),
};

/**
 * Check and report statements for `PaddingType.Always` configuration.
 * This autofix inserts a blank line between the given 2 statements.
 * If the `prevNode` has trailing comments, it inserts a blank line after the
 * trailing comments.
 */
const paddingAlwaysTester = (
  prevNode: TSESTree.Node,
  nextNode: TSESTree.Node,
  paddingContext: PaddingContext,
): void => {
  const { sourceCode, ruleContext } = paddingContext;
  const paddingLines = astUtils.getPaddingLineSequences(
    prevNode,
    nextNode,
    sourceCode,
  );

  // We've got some padding lines. Great.
  if (paddingLines.length > 0) {
    return;
  }

  // Missing padding line
  ruleContext.report({
    node: nextNode,
    message: 'Expected blank line before this statement.',
    fix(fixer: TSESLint.RuleFixer) {
      let prevToken = astUtils.getActualLastToken(sourceCode, prevNode);
      const nextToken = (sourceCode.getFirstTokenBetween(prevToken, nextNode, {
        includeComments: true,
        /**
         * Skip the trailing comments of the previous node.
         * This inserts a blank line after the last trailing comment.
         *
         * For example:
         *
         *     foo(); // trailing comment.
         *     // comment.
         *     bar();
         *
         * Get fixed to:
         *
         *     foo(); // trailing comment.
         *
         *     // comment.
         *     bar();
         */
        filter(token: TSESTree.Token): boolean {
          if (astUtils.areTokensOnSameLine(prevToken, token)) {
            prevToken = token;

            return false;
          }

          return true;
        },
      }) || nextNode) as TSESTree.Token;

      const insertText = astUtils.areTokensOnSameLine(prevToken, nextToken)
        ? '\n\n'
        : '\n';

      return fixer.insertTextAfter(prevToken, insertText);
    },
  });
};

// A mapping of PaddingType to PaddingTester
const paddingTesters: { [T in PaddingType]: PaddingTester } = {
  [PaddingType.Any]: () => true,
  [PaddingType.Always]: paddingAlwaysTester,
};

const createScopeInfo = (): ScopeInfo => {
  return (() => {
    let scope: Scope = null;

    return {
      get prevNode() {
        return scope.prevNode;
      },
      set prevNode(node) {
        scope.prevNode = node;
      },
      enter() {
        scope = { upper: scope, prevNode: null };
      },
      exit() {
        scope = scope.upper;
      },
    };
  })();
};

/**
 * Check whether the given node matches the statement type
 */
const nodeMatchesType = (
  node: TSESTree.Node,
  statementType: StatementTypes,
  paddingContext: PaddingContext,
): boolean => {
  let innerStatementNode = node;
  const { sourceCode } = paddingContext;

  // Dig into LabeledStatement body until it's not that anymore
  while (innerStatementNode.type === AST_NODE_TYPES.LabeledStatement) {
    innerStatementNode = innerStatementNode.body;
  }

  // If it's an array recursively check if any of the statement types match
  // the node
  if (Array.isArray(statementType)) {
    return statementType.some(type =>
      nodeMatchesType(innerStatementNode, type, paddingContext),
    );
  }

  return statementTesters[statementType](innerStatementNode, sourceCode);
};

/**
 * Executes matching padding tester for last matched padding config for given
 * nodes
 */
const testPadding = (
  prevNode: TSESTree.Node,
  nextNode: TSESTree.Node,
  paddingContext: PaddingContext,
): void => {
  const { configs } = paddingContext;

  const testType = (type: PaddingType) =>
    paddingTesters[type](prevNode, nextNode, paddingContext);

  for (let i = configs.length - 1; i >= 0; --i) {
    const {
      prevStatementType: prevType,
      nextStatementType: nextType,
      paddingType,
    } = configs[i];

    if (
      nodeMatchesType(prevNode, prevType, paddingContext) &&
      nodeMatchesType(nextNode, nextType, paddingContext)
    ) {
      return testType(paddingType);
    }
  }

  // There were no matching padding rules for the prevNode, nextNode,
  // paddingType combination... so we'll use PaddingType.Any which is always ok
  return testType(PaddingType.Any);
};

/**
 * Verify padding lines between the given node and the previous node.
 */
const verifyNode = (
  node: TSESTree.Node,
  paddingContext: PaddingContext,
): void => {
  const { scopeInfo } = paddingContext;

  // NOTE: ESLint types use ESTree which provides a Node type, however
  //  ESTree.Node doesn't support the parent property which is added by
  //  ESLint during traversal. Our best bet is to ignore the property access
  //  here as it's the only place that it's checked.

  if (!astUtils.isValidParent((node as any).parent.type)) {
    return;
  }

  if (scopeInfo.prevNode) {
    testPadding(scopeInfo.prevNode, node, paddingContext);
  }

  scopeInfo.prevNode = node;
};

/**
 * Creates an ESLint rule for a given set of padding Config objects.
 *
 * The algorithm is approximately this:
 *
 * For each 'scope' in the program
 * - Enter the scope (store the parent scope and previous node)
 * - For each statement in the scope
 *   - Check the current node and previous node against the Config objects
 *   - If the current node and previous node match a Config, check the padding.
 *     Otherwise, ignore it.
 *   - If the padding is missing (and required), report and fix
 *   - Store the current node as the previous
 *   - Repeat
 * - Exit scope (return to parent scope and clear previous node)
 *
 * The items we're looking for with this rule are ExpressionStatement nodes
 * where the first token is an Identifier with a name matching one of the Jest
 * functions. It's not foolproof, of course, but it's probably good enough for
 * almost all cases.
 *
 * The Config objects specify a padding type, a previous statement type, and a
 * next statement type. Wildcard statement types and padding types are
 * supported. The current node and previous node are checked against the
 * statement types. If they match then the specified padding type is
 * tested/enforced.
 *
 * See src/index.ts for examples of Config usage.
 */
export const createPaddingRule = (
  name: string,
  configs: Config[],
  deprecated = false,
) => {
  return createRule({
    name,
    meta: {
      docs: {
        description: 'Enforce assertion to be made in a test body',
      },
      fixable: 'whitespace',
      deprecated,
      messages: {},
      schema: [],
      type: 'suggestion',
    },
    defaultOptions: [],
    create(context) {
      const paddingContext = {
        ruleContext: context,
        sourceCode: context.getSourceCode(),
        scopeInfo: createScopeInfo(),
        configs,
      };

      const { scopeInfo } = paddingContext;

      return {
        Program: scopeInfo.enter,
        'Program:exit': scopeInfo.enter,
        BlockStatement: scopeInfo.enter,
        'BlockStatement:exit': scopeInfo.exit,
        SwitchStatement: scopeInfo.enter,
        'SwitchStatement:exit': scopeInfo.exit,
        ':statement': (node: TSESTree.Node) => verifyNode(node, paddingContext),
        SwitchCase(node: TSESTree.Node) {
          verifyNode(node, paddingContext);
          scopeInfo.enter();
        },
        'SwitchCase:exit': scopeInfo.exit,
      };
    },
  });
};
