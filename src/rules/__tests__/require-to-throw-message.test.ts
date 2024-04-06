import dedent from 'dedent';
import rule from '../require-to-throw-message';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('require-to-throw-message', rule, {
  valid: [
    // String
    "expect(() => { throw new Error('a'); }).toThrow('a');",
    "expect(() => { throw new Error('a'); }).toThrowError('a');",
    dedent`
      test('string', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow('a');
        await expect(throwErrorAsync()).rejects.toThrowError('a');
      })
    `,

    // Template literal
    "const a = 'a'; expect(() => { throw new Error('a'); }).toThrow(`${a}`);",
    "const a = 'a'; expect(() => { throw new Error('a'); }).toThrowError(`${a}`);",
    dedent`
      test('Template literal', async () => {
        const a = 'a';
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow(\`\${a}\`);
        await expect(throwErrorAsync()).rejects.toThrowError(\`\${a}\`);
      })
    `,

    // Regex
    "expect(() => { throw new Error('a'); }).toThrow(/^a$/);",
    "expect(() => { throw new Error('a'); }).toThrowError(/^a$/);",
    dedent`
      test('Regex', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow(/^a$/);
        await expect(throwErrorAsync()).rejects.toThrowError(/^a$/);
      })
    `,

    // Function
    "expect(() => { throw new Error('a'); }).toThrow((() => { return 'a'; })());",
    "expect(() => { throw new Error('a'); }).toThrowError((() => { return 'a'; })());",
    dedent`
      test('Function', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        const fn = () => { return 'a'; };
        await expect(throwErrorAsync()).rejects.toThrow(fn());
        await expect(throwErrorAsync()).rejects.toThrowError(fn());
      })
    `,

    // Allow no message for `not`.
    "expect(() => { throw new Error('a'); }).not.toThrow();",
    "expect(() => { throw new Error('a'); }).not.toThrowError();",
    dedent`
      test('Allow no message for "not"', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).resolves.not.toThrow();
        await expect(throwErrorAsync()).resolves.not.toThrowError();
      })
    `,
    'expect(a);',
  ],

  invalid: [
    // Empty toThrow
    {
      code: "expect(() => { throw new Error('a'); }).toThrow();",
      errors: [
        {
          messageId: 'addErrorMessage',
          data: { matcherName: 'toThrow' },
          column: 41,
          line: 1,
        },
      ],
    },
    // Empty toThrowError
    {
      code: "expect(() => { throw new Error('a'); }).toThrowError();",
      errors: [
        {
          messageId: 'addErrorMessage',
          data: { matcherName: 'toThrowError' },
          column: 41,
          line: 1,
        },
      ],
    },

    // Empty rejects.toThrow / rejects.toThrowError
    {
      code: dedent`
        test('empty rejects.toThrow', async () => {
          const throwErrorAsync = async () => { throw new Error('a') };
          await expect(throwErrorAsync()).rejects.toThrow();
          await expect(throwErrorAsync()).rejects.toThrowError();
        })
      `,
      errors: [
        {
          messageId: 'addErrorMessage',
          data: { matcherName: 'toThrow' },
          column: 43,
          line: 3,
        },
        {
          messageId: 'addErrorMessage',
          data: { matcherName: 'toThrowError' },
          column: 43,
          line: 4,
        },
      ],
    },
  ],
});
