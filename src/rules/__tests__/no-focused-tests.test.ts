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
          messageId: 'focusedTest',
          column: 10,
          line: 1,
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
          messageId: 'focusedTest',
          column: 9,
          line: 1,
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
          messageId: 'focusedTest',
          column: 10,
          line: 1,
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
          messageId: 'focusedTest',
          column: 10,
          line: 1,
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
          messageId: 'focusedTest',
          column: 10,
          line: 1,
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
          messageId: 'focusedTest',
          column: 4,
          line: 1,
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
          messageId: 'focusedTest',
          column: 15,
          line: 1,
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
          messageId: 'focusedTest',
          column: 4,
          line: 1,
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
          messageId: 'focusedTest',
          column: 4,
          line: 1,
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
          messageId: 'focusedTest',
          column: 4,
          line: 1,
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
          messageId: 'focusedTest',
          column: 6,
          line: 1,
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
          messageId: 'focusedTest',
          column: 17,
          line: 1,
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
          messageId: 'focusedTest',
          column: 6,
          line: 1,
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
          messageId: 'focusedTest',
          column: 6,
          line: 1,
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
          messageId: 'focusedTest',
          column: 6,
          line: 1,
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
          messageId: 'focusedTest',
          column: 1,
          line: 1,
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
          messageId: 'focusedTest',
          column: 1,
          line: 1,
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
          messageId: 'focusedTest',
          column: 1,
          line: 1,
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
          messageId: 'focusedTest',
          column: 1,
          line: 1,
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
          messageId: 'focusedTest',
          column: 10,
          line: 3,
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
          messageId: 'focusedTest',
          column: 14,
          line: 3,
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
          messageId: 'focusedTest',
          column: 1,
          line: 3,
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
          messageId: 'focusedTest',
          column: 14,
          line: 3,
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
          messageId: 'focusedTest',
          column: 1,
          line: 3,
        },
        {
          messageId: 'focusedTest',
          column: 1,
          line: 4,
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
          messageId: 'focusedTest',
          column: 9,
          line: 3,
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
