import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../no-focused-tests';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('no-focused-tests', rule, {
  valid: [
    'describe()',
    'it()',
    'describe.skip()',
    'it.skip()',
    'test()',
    'test.skip()',
    'var appliedOnly = describe.only; appliedOnly.apply(describe)',
    'var calledOnly = it.only; calledOnly.call(it)',
    'it.each()()',
    'it.each`table`()',
    'test.each()()',
    'test.each`table`()',
    'test.concurrent()',
  ],

  invalid: [
    {
      code: 'describe.only()',
      errors: [
        {
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 14,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'describe()',
            },
          ],
        },
      ],
    },
    {
      code: 'context.only()',
      errors: [
        {
          line: 1,
          column: 9,
          endLine: 1,
          endColumn: 13,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'context()',
            },
          ],
        },
      ],
      settings: { jest: { globalAliases: { describe: ['context'] } } },
    },
    {
      code: 'describe.only.each()()',
      errors: [
        {
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 14,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'describe.each()()',
            },
          ],
        },
      ],
    },
    {
      code: 'describe.only.each`table`()',
      errors: [
        {
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 14,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'describe.each`table`()',
            },
          ],
        },
      ],
    },
    {
      code: 'describe["only"]()',
      errors: [
        {
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 16,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'describe()',
            },
          ],
        },
      ],
    },
    {
      code: 'it.only()',
      errors: [
        {
          line: 1,
          column: 4,
          endLine: 1,
          endColumn: 8,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it()',
            },
          ],
        },
      ],
    },
    {
      code: 'it.concurrent.only.each``()',
      errors: [
        {
          line: 1,
          column: 15,
          endLine: 1,
          endColumn: 19,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it.concurrent.each``()',
            },
          ],
        },
      ],
    },
    {
      code: 'it.only.each()()',
      errors: [
        {
          line: 1,
          column: 4,
          endLine: 1,
          endColumn: 8,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it.each()()',
            },
          ],
        },
      ],
    },
    {
      code: 'it.only.each`table`()',
      errors: [
        {
          line: 1,
          column: 4,
          endLine: 1,
          endColumn: 8,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it.each`table`()',
            },
          ],
        },
      ],
    },
    {
      code: 'it["only"]()',
      errors: [
        {
          line: 1,
          column: 4,
          endLine: 1,
          endColumn: 10,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it()',
            },
          ],
        },
      ],
    },
    {
      code: 'test.only()',
      errors: [
        {
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 10,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'test()',
            },
          ],
        },
      ],
    },
    {
      code: 'test.concurrent.only.each()()',
      errors: [
        {
          line: 1,
          column: 17,
          endLine: 1,
          endColumn: 21,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'test.concurrent.each()()',
            },
          ],
        },
      ],
    },
    {
      code: 'test.only.each()()',
      errors: [
        {
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 10,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'test.each()()',
            },
          ],
        },
      ],
    },
    {
      code: 'test.only.each`table`()',
      errors: [
        {
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 10,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'test.each`table`()',
            },
          ],
        },
      ],
    },
    {
      code: 'test["only"]()',
      errors: [
        {
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 12,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'test()',
            },
          ],
        },
      ],
    },
    {
      code: 'fdescribe()',
      errors: [
        {
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 10,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'describe()',
            },
          ],
        },
      ],
    },
    {
      code: 'fit()',
      errors: [
        {
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 4,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it()',
            },
          ],
        },
      ],
    },
    {
      code: 'fit.each()()',
      errors: [
        {
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 4,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it.each()()',
            },
          ],
        },
      ],
    },
    {
      code: 'fit.each`table`()',
      errors: [
        {
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 4,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: 'it.each`table`()',
            },
          ],
        },
      ],
    },
  ],
});

ruleTester.run('no-focused-tests (with imports)', rule, {
  valid: [
    {
      code: dedent`
        import { describe as fdescribe } from '@jest/globals';

        fdescribe()
      `,
      parserOptions: { sourceType: 'module' },
    },
  ],

  invalid: [
    {
      code: dedent`
        const { describe } = require('@jest/globals');

        describe.only()
      `,
      errors: [
        {
          line: 3,
          column: 10,
          endLine: 3,
          endColumn: 14,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: dedent`
                const { describe } = require('@jest/globals');

                describe()
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        import { describe as describeThis } from '@jest/globals';

        describeThis.only()
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          line: 3,
          column: 14,
          endLine: 3,
          endColumn: 18,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: dedent`
                import { describe as describeThis } from '@jest/globals';

                describeThis()
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        const { fdescribe } = require('@jest/globals');

        fdescribe()
      `,
      errors: [
        {
          line: 3,
          column: 1,
          endLine: 3,
          endColumn: 10,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: dedent`
                const { fdescribe } = require('@jest/globals');

                describe()
              `,
            },
          ],
        },
      ],
    },
  ],
});

ruleTester.run('no-focused-tests (aliases)', rule, {
  valid: [],

  invalid: [
    {
      code: dedent`
        import { describe as describeThis } from '@jest/globals';

        describeThis.only()
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          line: 3,
          column: 14,
          endLine: 3,
          endColumn: 18,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: dedent`
                import { describe as describeThis } from '@jest/globals';

                describeThis()
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        import { fdescribe as describeJustThis } from '@jest/globals';

        describeJustThis()
        describeJustThis.each()()
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          line: 3,
          column: 1,
          endLine: 3,
          endColumn: 17,
          messageId: 'focusedTest',
        },
        {
          line: 4,
          column: 1,
          endLine: 4,
          endColumn: 17,
          messageId: 'focusedTest',
        },
      ],
    },
    {
      code: dedent`
        import { describe as context } from '@jest/globals';

        context.only.each()()
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 13,
          messageId: 'focusedTest',
          suggestions: [
            {
              messageId: 'suggestRemoveFocus',
              output: dedent`
                import { describe as context } from '@jest/globals';

                context.each()()
              `,
            },
          ],
        },
      ],
    },
  ],
});
