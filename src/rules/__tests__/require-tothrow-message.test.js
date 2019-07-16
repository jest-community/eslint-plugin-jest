'use strict';

const { RuleTester } = require('eslint');
const rule = require('../require-tothrow-message');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
});

ruleTester.run('require-tothrow-message', rule, {
  valid: [
    // String
    `test('string', async () => {
        const error = new Error('a');
        const throwErrorSync = () => { throw new Error(error) };
        const throwErrorAsync = async () => { throw new Error(error) };

        expect(() => throwErrorSync()).toThrow('a');
        expect(() => throwErrorSync()).toThrowError('a');

        await expect(throwErrorAsync()).rejects.toThrow('a');
        await expect(throwErrorAsync()).rejects.toThrowError('a');
    })`,

    // Template literal
    `test('Template literal', async () => {
        const a = 'a';

        const error = new Error('a');
        const throwErrorSync = () => { throw new Error(error) };
        const throwErrorAsync = async () => { throw new Error(error) };

        expect(() => throwErrorSync()).toThrow(\`\${a}\`);
        expect(() => throwErrorSync()).toThrowError(\`\${a}\`);

        await expect(throwErrorAsync()).rejects.toThrow(\`\${a}\`);
        await expect(throwErrorAsync()).rejects.toThrowError(\`\${a}\`);
    })`,

    // Regex
    `test('Regex', async () => {
        const error = new Error('a');
        const throwErrorSync = () => { throw new Error(error) };
        const throwErrorAsync = async () => { throw new Error(error) };

        expect(() => throwErrorSync()).toThrow(/^a$/);
        expect(() => throwErrorSync()).toThrowError(/^a$/);

        await expect(throwErrorAsync()).rejects.toThrow(/^a$/);
        await expect(throwErrorAsync()).rejects.toThrowError(/^a$/);
    })`,

    // Function
    `test('Function', async () => {
        const error = new Error('a');
        const throwErrorSync = () => { throw new Error(error) };
        const throwErrorAsync = async () => { throw new Error(error) };

        const fn = () => { return 'a'; };

        expect(() => throwErrorSync()).toThrow(fn());
        expect(() => throwErrorSync()).toThrowError(fn());

        await expect(throwErrorAsync()).rejects.toThrow(fn());
        await expect(throwErrorAsync()).rejects.toThrowError(fn());
    })`,

    // Allow no message for `not`.
    `test('Allow no message for "not"', async () => {
        const error = new Error('a');
        const throwErrorSync = () => { throw new Error(error) };
        const throwErrorAsync = async () => { throw new Error(error) };

        expect(() => throwErrorSync()).not.toThrow();
        expect(() => throwErrorSync()).not.toThrowError();

        await expect(throwErrorAsync()).resolves.not.toThrow();
        await expect(throwErrorAsync()).resolves.not.toThrowError();
    })`,
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
