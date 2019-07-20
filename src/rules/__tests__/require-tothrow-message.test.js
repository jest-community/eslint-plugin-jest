import { RuleTester } from 'eslint';
import rule from '../require-tothrow-message';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
});

ruleTester.run('require-tothrow-message', rule, {
  valid: [
    // String
    "expect(() => { throw new Error('a'); }).toThrow('a');",
    "expect(() => { throw new Error('a'); }).toThrowError('a');",
    `test('string', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow('a');
        await expect(throwErrorAsync()).rejects.toThrowError('a');
    })`,

    // Template literal
    "const a = 'a'; expect(() => { throw new Error('a'); }).toThrow(`${a}`);",
    "const a = 'a'; expect(() => { throw new Error('a'); }).toThrowError(`${a}`);",
    `test('Template literal', async () => {
        const a = 'a';
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow(\`\${a}\`);
        await expect(throwErrorAsync()).rejects.toThrowError(\`\${a}\`);
    })`,

    // Regex
    "expect(() => { throw new Error('a'); }).toThrow(/^a$/);",
    "expect(() => { throw new Error('a'); }).toThrowError(/^a$/);",
    `test('Regex', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow(/^a$/);
        await expect(throwErrorAsync()).rejects.toThrowError(/^a$/);
    })`,

    // Function
    "expect(() => { throw new Error('a'); })" +
      ".toThrow((() => { return 'a'; })());",
    "expect(() => { throw new Error('a'); })" +
      ".toThrowError((() => { return 'a'; })());",
    `test('Function', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        const fn = () => { return 'a'; };
        await expect(throwErrorAsync()).rejects.toThrow(fn());
        await expect(throwErrorAsync()).rejects.toThrowError(fn());
    })`,

    // Allow no message for `not`.
    "expect(() => { throw new Error('a'); }).not.toThrow();",
    "expect(() => { throw new Error('a'); }).not.toThrowError();",
    `test('Allow no message for "not"', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).resolves.not.toThrow();
        await expect(throwErrorAsync()).resolves.not.toThrowError();
    })`,
    'expect(a);',
  ],

  invalid: [
    // Empty toThrow
    {
      code: "expect(() => { throw new Error('a'); }).toThrow();",
      errors: [
        {
          messageId: 'requireRethrow',
          data: { propertyName: 'toThrow' },
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
          messageId: 'requireRethrow',
          data: { propertyName: 'toThrowError' },
          column: 41,
          line: 1,
        },
      ],
    },

    // Empty rejects.toThrow / rejects.toThrowError
    {
      code: `test('empty rejects.toThrow', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow();
        await expect(throwErrorAsync()).rejects.toThrowError();
    })`,
      errors: [
        {
          messageId: 'requireRethrow',
          data: { propertyName: 'toThrow' },
          column: 49,
          line: 3,
        },
        {
          messageId: 'requireRethrow',
          data: { propertyName: 'toThrowError' },
          column: 49,
          line: 4,
        },
      ],
    },
  ],
});
