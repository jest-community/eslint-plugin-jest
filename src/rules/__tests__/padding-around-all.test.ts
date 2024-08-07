import type { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../padding-around-all';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 6,
  },
});

// todo: these should be more fulsome
const testCase = {
  code: `
const someText = 'abc';
afterAll(() => {
});
describe('someText', () => {
  const something = 'abc';
  // A comment
  afterAll(() => {
    // stuff
  });
  afterAll(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';
  afterAll(() => {
    // stuff
  });
});
`,
  output: `
const someText = 'abc';

afterAll(() => {
});

describe('someText', () => {
  const something = 'abc';

  // A comment
  afterAll(() => {
    // stuff
  });

  afterAll(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';

  afterAll(() => {
    // stuff
  });
});
`,
  errors: [
    {
      messageId: 'missingPadding',
      line: 3,
      column: 1,
    },
    {
      messageId: 'missingPadding',
      line: 5,
      column: 1,
    },
    {
      messageId: 'missingPadding',
      line: 8,
      column: 3,
    },
    {
      messageId: 'missingPadding',
      line: 11,
      column: 3,
    },
    {
      messageId: 'missingPadding',
      line: 18,
      column: 3,
    },
  ],
} satisfies TSESLint.InvalidTestCase<'missingPadding', never>;

ruleTester.run('padding-around-all', rule, {
  valid: [
    testCase.output,
    dedent`
      xyz:
      afterEach(() => {});
    `,
  ],
  invalid: [
    ...['src/component.test.jsx', 'src/component.test.js'].map(filename => ({
      ...testCase,
      filename,
    })),
    {
      code: dedent`
        const someText = 'abc'
        ;afterEach(() => {})
      `,
      output: dedent`
        const someText = 'abc'

        ;afterEach(() => {})
      `,
      errors: [
        {
          messageId: 'missingPadding',
          line: 2,
          column: 2,
        },
      ],
    },
    {
      code: dedent`
        const someText = 'abc';
        xyz:
        afterEach(() => {});
      `,
      output: dedent`
        const someText = 'abc';

        xyz:
        afterEach(() => {});
      `,
      errors: [
        {
          messageId: 'missingPadding',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: dedent`
        const expr = 'Papayas';
        beforeEach(() => {});
        it('does something?', () => {
          switch (expr) {
            case 'Oranges':
              expect(expr).toBe('Oranges');
              break;
            case 'Mangoes':
            case 'Papayas':
              const v = 1;
              expect(v).toBe(1);
              console.log('Mangoes and papayas are $2.79 a pound.');
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            default:
              console.log(\`Sorry, we are out of $\{expr}.\`);
          }
        });
      `,
      output: dedent`
        const expr = 'Papayas';

        beforeEach(() => {});

        it('does something?', () => {
          switch (expr) {
            case 'Oranges':
              expect(expr).toBe('Oranges');

              break;
            case 'Mangoes':
            case 'Papayas':
              const v = 1;

              expect(v).toBe(1);

              console.log('Mangoes and papayas are $2.79 a pound.');
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            default:
              console.log(\`Sorry, we are out of $\{expr}.\`);
          }
        });
      `,
      errors: [
        {
          messageId: 'missingPadding',
          line: 2,
          column: 1,
          endLine: 2,
          endColumn: 22,
        },
        {
          messageId: 'missingPadding',
          line: 3,
          column: 1,
          endLine: 18,
          endColumn: 4,
        },
        {
          messageId: 'missingPadding',
          line: 7,
          column: 7,
          endLine: 7,
          endColumn: 13,
        },
        {
          messageId: 'missingPadding',
          line: 11,
          column: 7,
          endLine: 11,
          endColumn: 25,
        },
        {
          messageId: 'missingPadding',
          line: 12,
          column: 7,
          endLine: 12,
          endColumn: 61,
        },
      ],
    },
  ],
});
