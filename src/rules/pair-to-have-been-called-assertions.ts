import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createRule,
  getAccessorValue,
  getNodeName,
  isTypeOfJestFnCall,
  parseJestFnCall,
} from './utils';

interface MockCallInfo {
  node: TSESTree.Node;
  matcherName: string;
  expectCall: TSESTree.CallExpression;
  nthIndex?: number;
}

interface CalledTimesZeroInfo {
  node: TSESTree.Node;
  calledTimesName: string;
}

interface TestContext {
  expectCallsWithCalledWith: Map<string, MockCallInfo[]>;
  expectCallsWithCalledTimes: Set<string>;
  expectCallsWithCalledTimesZero: Map<string, CalledTimesZeroInfo>;
}

const createTestContext = (): TestContext => ({
  expectCallsWithCalledWith: new Map(),
  expectCallsWithCalledTimes: new Set(),
  expectCallsWithCalledTimesZero: new Map(),
});

const CALLED_WITH_MATCHERS = new Set([
  'toHaveBeenCalledWith',
  'toBeCalledWith',
  'toHaveBeenNthCalledWith',
  'toBeNthCalledWith',
  'toHaveBeenLastCalledWith',
  'toBeLastCalledWith',
]);

const CALLED_TIMES_MATCHERS = new Set([
  'toHaveBeenCalledTimes',
  'toBeCalledTimes',
]);

const NTH_CALLED_WITH_MATCHERS = new Set([
  'toHaveBeenNthCalledWith',
  'toBeNthCalledWith',
]);

/**
 * Generate a string representation of a template literal node
 */
function getTemplateLiteralString(node: TSESTree.TemplateLiteral) {
  const parts = node.quasis.map((quasi, i) => {
    const expr = node.expressions[i];
    const exprText =
      expr?.type === AST_NODE_TYPES.Identifier
        ? `\${${expr.name}}`
        : expr
          ? '${expr}'
          : '';

    return quasi.value.raw + exprText;
  });

  return `template:${parts.join('')}`;
}

/**
 * Get a string representation of the expression for tracking purposes
 * Extends getNodeName() to handle:
 * - ChainExpression (optional chaining): obj?.method
 * - Template literals with expressions: obj[`method${suffix}`]
 */
function getMockIdentifier(
  node: TSESTree.Expression | TSESTree.SpreadElement,
): string | null {
  if (node.type === AST_NODE_TYPES.SpreadElement) {
    return null;
  }

  // Handle optional chaining: obj?.method
  if (node.type === AST_NODE_TYPES.ChainExpression) {
    return getMockIdentifier(node.expression);
  }

  // Handle template literals with expressions in member expressions
  if (
    node.type === AST_NODE_TYPES.MemberExpression &&
    node.property.type === AST_NODE_TYPES.TemplateLiteral
  ) {
    const object = getMockIdentifier(node.object);
    const property = getTemplateLiteralString(node.property);

    return object ? `${object}.${property}` : /* istanbul ignore next */ null;
  }

  // Use built-in utility for all other cases
  return getNodeName(node);
}

/**
 * Determine the correct calledTimes matcher name based on the calledWith matcher
 */
function getCalledTimesName(matcherName: string) {
  return matcherName.startsWith('toHaveBeen')
    ? 'toHaveBeenCalledTimes'
    : 'toBeCalledTimes';
}

/**
 * Extract the nth index from NthCalledWith matcher arguments
 */
function extractNthIndex(
  matcherName: string,
  args: TSESTree.CallExpressionArgument[],
) {
  if (!NTH_CALLED_WITH_MATCHERS.has(matcherName)) {
    return undefined;
  }

  const [firstArg] = args;

  return firstArg.type === AST_NODE_TYPES.Literal &&
    typeof firstArg.value === 'number'
    ? firstArg.value
    : undefined;
}

/**
 * Calculate suggested call count based on the assertions
 */
function getSuggestedCount(calledWithCalls: MockCallInfo[]) {
  const maxNthIndex = Math.max(
    0,
    ...calledWithCalls
      .map(({ nthIndex }) => nthIndex)
      .filter((index): index is number => index !== undefined),
  );

  return maxNthIndex || calledWithCalls.length;
}

/**
 * Find the statement node containing the given node
 */
function findContainingStatement(node: TSESTree.Node) {
  let current: TSESTree.Node | undefined = node;

  while (current) {
    if (current.type === AST_NODE_TYPES.ExpressionStatement) {
      return current;
    }
    current = current.parent;
  }

  /* istanbul ignore next */
  return undefined;
}

/**
 * Report contradictory toHaveBeenCalledTimes(0) assertions
 */
function reportContradictoryAssertions(
  context: TSESLint.RuleContext<string, unknown[]>,
  calledWithCalls: MockCallInfo[],
  calledTimesZero: CalledTimesZeroInfo,
) {
  for (const { node: matcherNode, matcherName } of calledWithCalls) {
    context.report({
      node: matcherNode,
      messageId: 'contradictoryCallTimes',
      data: {
        matcherName,
        calledTimesName: calledTimesZero.calledTimesName,
      },
    });
  }
}

/**
 * Report missing toHaveBeenCalledTimes assertions
 */
function reportMissingCalledTimes(
  context: TSESLint.RuleContext<string, unknown[]>,
  sourceCode: TSESLint.SourceCode,
  calledWithCalls: MockCallInfo[],
) {
  const suggestedCount = getSuggestedCount(calledWithCalls);
  const [firstCall] = calledWithCalls;
  const calledTimesNameForFix = getCalledTimesName(firstCall.matcherName);
  const fixer = createCalledTimesFixer(
    sourceCode,
    firstCall.expectCall,
    calledTimesNameForFix,
    suggestedCount,
  );

  for (let index = 0; index < calledWithCalls.length; index++) {
    const { node: matcherNode, matcherName } = calledWithCalls[index];
    const calledTimesName = getCalledTimesName(matcherName);

    context.report({
      node: matcherNode,
      messageId: 'preferStrictMockAssertions',
      data: {
        matcherName,
        calledTimesName,
        suggestedCount: String(suggestedCount),
      },
      fix: index === 0 ? fixer : undefined,
    });
  }
}

/**
 * Create a fixer that inserts toHaveBeenCalledTimes before the expect call
 */
function createCalledTimesFixer(
  sourceCode: TSESLint.SourceCode,
  expectCall: TSESTree.CallExpression,
  calledTimesName: string,
  suggestedCount: number,
) {
  return (fixer: TSESLint.RuleFixer) => {
    const [mockArg] = expectCall.arguments;

    /* istanbul ignore if */
    if (!mockArg) {
      return null;
    }

    const statement = findContainingStatement(expectCall);

    /* istanbul ignore if */
    if (!statement) {
      return null;
    }

    // Get the mock expression and create the fix
    const indent = ' '.repeat(statement.loc.start.column);
    const mockText = sourceCode.getText(mockArg);
    const fixText = `expect(${mockText}).${calledTimesName}(${suggestedCount});\n${indent}`;

    return fixer.insertTextBefore(statement, fixText);
  };
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description:
        'Require `toHaveBeenCalledTimes()` when using `toHaveBeenCalledWith()`',
    },
    messages: {
      preferStrictMockAssertions:
        'Prefer using {{ calledTimesName }}({{ suggestedCount }}) with {{ matcherName }}() to ensure exact call count',
      contradictoryCallTimes:
        'Contradictory assertion: {{ calledTimesName }}(0) is used but {{ matcherName }}() expects the mock to be called',
    },
    type: 'suggestion',
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const { sourceCode } = context;

    // Stack to track nested test functions
    const testStack: TestContext[] = [];

    let currentTestContext: TestContext | null = null;

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        // Check if this is a test function call (it/test)
        if (jestFnCall?.type === 'test') {
          // Start tracking for this test
          currentTestContext = createTestContext();

          testStack.push(currentTestContext);
        }

        // Only track expect calls if we're inside a test
        if (jestFnCall?.type !== 'expect' || !currentTestContext) {
          return;
        }

        // Ignore expect calls with 'not' modifier
        if (jestFnCall.modifiers.some(mod => getAccessorValue(mod) === 'not')) {
          return;
        }

        const { matcher, args, head } = jestFnCall;
        const matcherName = getAccessorValue(matcher);

        // Get the expect() call expression
        const { parent: expectCall } = head.node;

        /* istanbul ignore if */
        if (expectCall?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        // Get the mock function argument from expect(mockFn)
        const [expectArg] = expectCall.arguments;
        const mockName = getMockIdentifier(expectArg);

        /* istanbul ignore if */
        if (!mockName) {
          return;
        }

        // Track expect calls with *CalledWith matchers
        if (CALLED_WITH_MATCHERS.has(matcherName)) {
          if (!currentTestContext.expectCallsWithCalledWith.has(mockName)) {
            currentTestContext.expectCallsWithCalledWith.set(mockName, []);
          }

          currentTestContext.expectCallsWithCalledWith.get(mockName)!.push({
            node: matcher,
            matcherName,
            expectCall,
            nthIndex: extractNthIndex(matcherName, args),
          });
        }

        // Track expect calls with *CalledTimes matchers
        if (CALLED_TIMES_MATCHERS.has(matcherName)) {
          currentTestContext.expectCallsWithCalledTimes.add(mockName);

          // Check if the argument is 0, which would be contradictory with toHaveBeenCalledWith
          const [firstArg] = args;

          if (
            firstArg?.type === AST_NODE_TYPES.Literal &&
            firstArg.value === 0
          ) {
            currentTestContext.expectCallsWithCalledTimesZero.set(mockName, {
              node: matcher,
              calledTimesName: matcherName,
            });
          }
        }
      },
      'CallExpression:exit'(node) {
        // Check if we're exiting a test function
        if (!isTypeOfJestFnCall(node, context, ['test'])) {
          return;
        }

        // Pop the test context and check for violations
        const testContext = testStack.pop();

        /* istanbul ignore if */
        if (!testContext) {
          return;
        }

        // Check for violations in expect calls
        for (const [
          mockName,
          calledWithCalls,
        ] of testContext.expectCallsWithCalledWith) {
          const calledTimesZero =
            testContext.expectCallsWithCalledTimesZero.get(mockName);

          // Check for contradictory toHaveBeenCalledTimes(0) with toHaveBeenCalledWith
          if (calledTimesZero) {
            reportContradictoryAssertions(
              context,
              calledWithCalls,
              calledTimesZero,
            );
          } else if (!testContext.expectCallsWithCalledTimes.has(mockName)) {
            // Check for toHaveBeenCalledWith/toBeCalledWith without corresponding toHaveBeenCalledTimes/toBeCalledTimes
            reportMissingCalledTimes(context, sourceCode, calledWithCalls);
          }
        }

        // Update currentTestContext to parent or null
        currentTestContext = testStack.at(-1) ?? null;
      },
    };
  },
});
