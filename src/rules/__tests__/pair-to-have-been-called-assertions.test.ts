import rule from '../pair-to-have-been-called-assertions';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2020,
  },
});

ruleTester.run('pair-to-have-been-called-assertions', rule, {
  valid: [
    // Has both toHaveBeenCalledWith and toHaveBeenCalledTimes
    'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1); expect(mockFn).toHaveBeenCalledWith("arg"); });',
    // Has both toBeCalledWith and toBeCalledTimes
    'it("foo", function() { expect(mockFn).toBeCalledTimes(1); expect(mockFn).toBeCalledWith("arg"); });',
    // Only toHaveBeenCalledTimes without toHaveBeenCalledWith
    'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1); });',
    // toHaveBeenCalled without CalledWith - not detected (handled by prefer-called-with rule)
    'test("foo", function() { expect(mockFn).toHaveBeenCalled(); });',
    // toBeCalled without CalledWith - not detected (handled by prefer-called-with rule)
    'test("foo", function() { expect(mockFn).toBeCalled(); });',
    // toHaveBeenCalledWith with toHaveBeenCalledTimes (empty call)
    'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1); expect(mockFn).toHaveBeenCalledWith(); });',
    // Multiple mocks, all properly paired
    'test("foo", function() { expect(mockFn1).toHaveBeenCalledTimes(1); expect(mockFn1).toHaveBeenCalledWith("arg1"); expect(mockFn2).toHaveBeenCalledTimes(1); expect(mockFn2).toHaveBeenCalledWith("arg2"); });',
    // Using not modifier
    'test("foo", function() { expect(mockFn).not.toHaveBeenCalledWith("arg"); });',
    // MemberExpression with both assertions
    'test("foo", function() { expect(props.onIssueChange).toHaveBeenCalledTimes(1); expect(props.onIssueChange).toHaveBeenCalledWith("arg"); });',
    // Multiple tests in same file - each test is independent
    'test("test1", function() { expect(mockFn).toHaveBeenCalledTimes(1); expect(mockFn).toHaveBeenCalledWith("arg1"); }); test("test2", function() { expect(mockFn).toHaveBeenCalledTimes(1); expect(mockFn).toHaveBeenCalledWith("arg2"); });',
    // Wrapped mocks with mocked()
    'test("foo", function() { expect(mocked(mockFn)).toHaveBeenCalledTimes(1); expect(mocked(mockFn)).toHaveBeenCalledWith("arg"); });',
    // Wrapped with jest.mocked()
    'test("foo", function() { expect(jest.mocked(obj.method)).toHaveBeenCalledTimes(1); expect(jest.mocked(obj.method)).toHaveBeenCalledWith("arg"); });',
    // toHaveBeenNthCalledWith with toHaveBeenCalledTimes
    'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(2); expect(mockFn).toHaveBeenNthCalledWith(1, "first"); });',
    'test("foo", function() { expect(mockFn).toBeCalledTimes(2); expect(mockFn).toBeNthCalledWith(2, "second"); });',
    // toHaveBeenLastCalledWith with toHaveBeenCalledTimes
    'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(3); expect(mockFn).toHaveBeenLastCalledWith("last"); });',
    'test("foo", function() { expect(mockFn).toBeCalledTimes(1); expect(mockFn).toBeLastCalledWith("only"); });',
    // Mixed matchers with toHaveBeenCalledTimes
    'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(3); expect(mockFn).toHaveBeenCalledWith("arg1"); expect(mockFn).toHaveBeenNthCalledWith(2, "arg2"); expect(mockFn).toHaveBeenLastCalledWith("arg3"); });',
    // Computed properties with bracket notation
    'test("foo", function() { expect(obj["method"]).toHaveBeenCalledTimes(1); expect(obj["method"]).toHaveBeenCalledWith("arg"); });',
    // Optional chaining
    'test("foo", function() { expect(obj?.method).toHaveBeenCalledTimes(1); expect(obj?.method).toHaveBeenCalledWith("arg"); });',
    // Computed properties with template literals
    'test("foo", function() { const suffix = ""; expect(mock[`method${suffix}`]).toHaveBeenCalledTimes(1); expect(mock[`method${suffix}`]).toHaveBeenCalledWith("arg"); });',
    // Spread element in expect (edge case - will be ignored)
    'test("foo", function() { expect(...args).toHaveBeenCalledTimes(1); expect(...args).toHaveBeenCalledWith("arg"); });',
  ],

  invalid: [
    // Missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toHaveBeenCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1);\n                         expect(mockFn).toHaveBeenCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Missing toBeCalledTimes
    {
      code: 'it("foo", function() { expect(mockFn).toBeCalledWith("arg"); });',
      output:
        'it("foo", function() { expect(mockFn).toBeCalledTimes(1);\n                       expect(mockFn).toBeCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toBeCalledWith',
            calledTimesName: 'toBeCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Multiple calls to toHaveBeenCalledWith without toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toHaveBeenCalledWith("arg1"); expect(mockFn).toHaveBeenCalledWith("arg2"); });',
      output:
        'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(2);\n                         expect(mockFn).toHaveBeenCalledWith("arg1"); expect(mockFn).toHaveBeenCalledWith("arg2"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '2',
          },
        },
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '2',
          },
        },
      ],
    },
    // One mock properly paired, another missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn1).toHaveBeenCalledTimes(1); expect(mockFn1).toHaveBeenCalledWith("arg1"); expect(mockFn2).toHaveBeenCalledWith("arg2"); });',
      output:
        'test("foo", function() { expect(mockFn1).toHaveBeenCalledTimes(1); expect(mockFn1).toHaveBeenCalledWith("arg1"); expect(mockFn2).toHaveBeenCalledTimes(1);\n                                                                                                                 expect(mockFn2).toHaveBeenCalledWith("arg2"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // MemberExpression missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(props.onIssueChange).toHaveBeenCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(props.onIssueChange).toHaveBeenCalledTimes(1);\n                         expect(props.onIssueChange).toHaveBeenCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Multiple tests - one correct, one incorrect
    {
      code: 'test("test1", function() { expect(mockFn).toHaveBeenCalledTimes(1); expect(mockFn).toHaveBeenCalledWith("arg1"); }); test("test2", function() { expect(mockFn).toHaveBeenCalledWith("arg2"); });',
      output:
        'test("test1", function() { expect(mockFn).toHaveBeenCalledTimes(1); expect(mockFn).toHaveBeenCalledWith("arg1"); }); test("test2", function() { expect(mockFn).toHaveBeenCalledTimes(1);\n                                                                                                                                                expect(mockFn).toHaveBeenCalledWith("arg2"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Wrapped mock missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mocked(mockFn)).toHaveBeenCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(mocked(mockFn)).toHaveBeenCalledTimes(1);\n                         expect(mocked(mockFn)).toHaveBeenCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // toHaveBeenNthCalledWith missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toHaveBeenNthCalledWith(1, "arg"); });',
      output:
        'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1);\n                         expect(mockFn).toHaveBeenNthCalledWith(1, "arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenNthCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // toHaveBeenNthCalledWith with variable index missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { const index = 1; expect(mockFn).toHaveBeenNthCalledWith(index, "arg"); });',
      output:
        'test("foo", function() { const index = 1; expect(mockFn).toHaveBeenCalledTimes(1);\n                                          expect(mockFn).toHaveBeenNthCalledWith(index, "arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenNthCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // toBeNthCalledWith missing toBeCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toBeNthCalledWith(2, "arg"); });',
      output:
        'test("foo", function() { expect(mockFn).toBeCalledTimes(2);\n                         expect(mockFn).toBeNthCalledWith(2, "arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toBeNthCalledWith',
            calledTimesName: 'toBeCalledTimes',
            suggestedCount: '2',
          },
        },
      ],
    },
    // toHaveBeenLastCalledWith missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toHaveBeenLastCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1);\n                         expect(mockFn).toHaveBeenLastCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenLastCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // toBeLastCalledWith missing toBeCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toBeLastCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(mockFn).toBeCalledTimes(1);\n                         expect(mockFn).toBeLastCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toBeLastCalledWith',
            calledTimesName: 'toBeCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Mixed matchers - some with toHaveBeenCalledTimes, some without
    {
      code: 'test("foo", function() { expect(mockFn1).toHaveBeenCalledTimes(2); expect(mockFn1).toHaveBeenNthCalledWith(1, "arg1"); expect(mockFn2).toHaveBeenLastCalledWith("arg2"); });',
      output:
        'test("foo", function() { expect(mockFn1).toHaveBeenCalledTimes(2); expect(mockFn1).toHaveBeenNthCalledWith(1, "arg1"); expect(mockFn2).toHaveBeenCalledTimes(1);\n                                                                                                                       expect(mockFn2).toHaveBeenLastCalledWith("arg2"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenLastCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Computed properties missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(obj["method"]).toHaveBeenCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(obj["method"]).toHaveBeenCalledTimes(1);\n                         expect(obj["method"]).toHaveBeenCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Mixed CalledWith and NthCalledWith - should suggest based on highest Nth
    {
      code: 'test("foo", function() { expect(props.onIssueChange).toHaveBeenCalledWith("none"); expect(props.onIssueChange).toHaveBeenNthCalledWith(1, "none"); expect(props.onIssueChange).toHaveBeenNthCalledWith(2, "lowVisibility"); });',
      output:
        'test("foo", function() { expect(props.onIssueChange).toHaveBeenCalledTimes(2);\n                         expect(props.onIssueChange).toHaveBeenCalledWith("none"); expect(props.onIssueChange).toHaveBeenNthCalledWith(1, "none"); expect(props.onIssueChange).toHaveBeenNthCalledWith(2, "lowVisibility"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '2',
          },
        },
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenNthCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '2',
          },
        },
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenNthCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '2',
          },
        },
      ],
    },
    // Optional chaining missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(obj?.method).toHaveBeenCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(obj?.method).toHaveBeenCalledTimes(1);\n                         expect(obj?.method).toHaveBeenCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Template literals in computed properties missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { const suffix = ""; expect(mock[`method${suffix}`]).toHaveBeenCalledWith("arg"); });',
      output:
        'test("foo", function() { const suffix = ""; expect(mock[`method${suffix}`]).toHaveBeenCalledTimes(1);\n                                            expect(mock[`method${suffix}`]).toHaveBeenCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // Template literal with complex expression missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mock[`method${obj.prop}`]).toHaveBeenCalledWith("arg"); });',
      output:
        'test("foo", function() { expect(mock[`method${obj.prop}`]).toHaveBeenCalledTimes(1);\n                         expect(mock[`method${obj.prop}`]).toHaveBeenCalledWith("arg"); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // toHaveBeenCalledWith without arguments missing toHaveBeenCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toHaveBeenCalledWith(); });',
      output:
        'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1);\n                         expect(mockFn).toHaveBeenCalledWith(); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toHaveBeenCalledWith',
            calledTimesName: 'toHaveBeenCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
    // toBeCalledWith without arguments missing toBeCalledTimes
    {
      code: 'test("foo", function() { expect(mockFn).toBeCalledWith(); });',
      output:
        'test("foo", function() { expect(mockFn).toBeCalledTimes(1);\n                         expect(mockFn).toBeCalledWith(); });',
      errors: [
        {
          messageId: 'preferStrictMockAssertions',
          data: {
            matcherName: 'toBeCalledWith',
            calledTimesName: 'toBeCalledTimes',
            suggestedCount: '1',
          },
        },
      ],
    },
  ],
});

// Tests for contradictory toHaveBeenCalledTimes(0)
ruleTester.run(
  'pair-to-have-been-called-assertions (contradictory assertions)',
  rule,
  {
    valid: [
      // toHaveBeenCalledTimes(0) without toHaveBeenCalledWith is fine
      'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(0); });',
      'test("foo", function() { expect(mockFn).toBeCalledTimes(0); });',
      // toHaveBeenCalledTimes(1+) with toHaveBeenCalledWith is fine
      'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(1); expect(mockFn).toHaveBeenCalledWith("arg"); });',
    ],
    invalid: [
      // Contradictory: toHaveBeenCalledTimes(0) but toHaveBeenCalledWith expects a call
      {
        code: 'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(0); expect(mockFn).toHaveBeenCalledWith("arg"); });',
        errors: [
          {
            messageId: 'contradictoryCallTimes',
            data: {
              matcherName: 'toHaveBeenCalledWith',
              calledTimesName: 'toHaveBeenCalledTimes',
            },
          },
        ],
      },
      // Contradictory: toBeCalledTimes(0) but toBeCalledWith expects a call
      {
        code: 'test("foo", function() { expect(mockFn).toBeCalledTimes(0); expect(mockFn).toBeCalledWith("arg"); });',
        errors: [
          {
            messageId: 'contradictoryCallTimes',
            data: {
              matcherName: 'toBeCalledWith',
              calledTimesName: 'toBeCalledTimes',
            },
          },
        ],
      },
      // Contradictory: toHaveBeenCalledTimes(0) with toHaveBeenNthCalledWith
      {
        code: 'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(0); expect(mockFn).toHaveBeenNthCalledWith(1, "arg"); });',
        errors: [
          {
            messageId: 'contradictoryCallTimes',
            data: {
              matcherName: 'toHaveBeenNthCalledWith',
              calledTimesName: 'toHaveBeenCalledTimes',
            },
          },
        ],
      },
      // Contradictory: toHaveBeenCalledTimes(0) with toHaveBeenLastCalledWith
      {
        code: 'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(0); expect(mockFn).toHaveBeenLastCalledWith("arg"); });',
        errors: [
          {
            messageId: 'contradictoryCallTimes',
            data: {
              matcherName: 'toHaveBeenLastCalledWith',
              calledTimesName: 'toHaveBeenCalledTimes',
            },
          },
        ],
      },
      // Multiple contradictory assertions
      {
        code: 'test("foo", function() { expect(mockFn).toHaveBeenCalledTimes(0); expect(mockFn).toHaveBeenCalledWith("arg1"); expect(mockFn).toHaveBeenCalledWith("arg2"); });',
        errors: [
          {
            messageId: 'contradictoryCallTimes',
            data: {
              matcherName: 'toHaveBeenCalledWith',
              calledTimesName: 'toHaveBeenCalledTimes',
            },
          },
          {
            messageId: 'contradictoryCallTimes',
            data: {
              matcherName: 'toHaveBeenCalledWith',
              calledTimesName: 'toHaveBeenCalledTimes',
            },
          },
        ],
      },
    ],
  },
);
