import { TSESLint } from '@typescript-eslint/utils';
import rule from '../prefer-equality-matcher';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

type RuleMessages<TRuleModule extends TSESLint.RuleModule<string>> =
  TRuleModule extends TSESLint.RuleModule<infer TMessageIds>
    ? TMessageIds
    : never;

type RuleSuggestionOutput = TSESLint.SuggestionOutput<
  RuleMessages<typeof rule>
>;

const expectSuggestions = (
  output: (equalityMatcher: string) => string,
): RuleSuggestionOutput[] => {
  return ['toBe', 'toEqual', 'toStrictEqual'].map<RuleSuggestionOutput>(
    equalityMatcher => ({
      messageId: 'suggestEqualityMatcher',
      data: { equalityMatcher },
      output: output(equalityMatcher),
    }),
  );
};

ruleTester.run('prefer-equality-matcher: ===', rule, {
  valid: [
    'expect(a == 1).toBe(true)',
    'expect(1 == a).toBe(true)',
    'expect(a == b).toBe(true)',
  ],
  invalid: [
    {
      code: 'expect(a === b).toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b).toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).not.${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.not.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b).not.toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).not.${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b).not.toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.not.toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.not.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.not.toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b)["resolves"].not.toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.${equalityMatcher}(b);`,
          ),
          column: 29,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a === b)["resolves"]["not"]["toBe"](false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.${equalityMatcher}(b);`,
          ),
          column: 29,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-equality-matcher: !==', rule, {
  valid: [
    'expect(a != 1).toBe(true)',
    'expect(1 != a).toBe(true)',
    'expect(a != b).toBe(true)',
  ],
  invalid: [
    {
      code: 'expect(a !== b).toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).not.${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a !== b).toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.not.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a !== b).not.toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a !== b).not.toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).not.${equalityMatcher}(b);`,
          ),
          column: 17,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.not.toBe(true);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.not.toBe(false);',
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a).resolves.not.${equalityMatcher}(b);`,
          ),
          column: 26,
          line: 1,
        },
      ],
    },
  ],
});
