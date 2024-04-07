import type { TSESLint } from '@typescript-eslint/utils';
import rule from '../prefer-equality-matcher';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

type RuleMessages<TRuleModule extends TSESLint.RuleModule<string, unknown[]>> =
  TRuleModule extends TSESLint.RuleModule<infer TMessageIds, unknown[]>
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
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect.assertions(1)',
    'expect(true).toBe(...true)',
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
      code: 'expect(a === b,).toBe(true,);',
      parserOptions: { ecmaVersion: 2017 },
      errors: [
        {
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            equalityMatcher => `expect(a,).${equalityMatcher}(b,);`,
          ),
          column: 18,
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
          column: 21,
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
          column: 21,
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
          column: 30,
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
          column: 30,
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
          column: 33,
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
          column: 36,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-equality-matcher: !==', rule, {
  valid: [
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect.assertions(1)',
    'expect(true).toBe(...true)',
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
          column: 21,
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
          column: 21,
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
          column: 30,
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
          column: 30,
          line: 1,
        },
      ],
    },
  ],
});
