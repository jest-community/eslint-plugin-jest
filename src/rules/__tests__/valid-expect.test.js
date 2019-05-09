'use strict';

const { RuleTester } = require('eslint');
const rule = require('../valid-expect');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
});

ruleTester.run('valid-expect', rule, {
  valid: [
    'expect("something").toEqual("else");',
    'expect(true).toBeDefined();',
    'expect([1, 2, 3]).toEqual([1, 2, 3]);',
    'expect(undefined).not.toBeDefined();',
    {
      code:
        'test("valid-expect", () => { return expect(Promise.resolve(2)).resolves.toBeDefined(); });',
      options: [{ alwaysAwait: false }],
    },
    {
      code:
        'test("valid-expect", () => { return expect(Promise.reject(2)).rejects.toBeDefined(); });',
      options: [{ alwaysAwait: false }],
    },
    {
      code:
        'test("valid-expect", () => { return expect(Promise.resolve(2)).not.resolves.toBeDefined(); });',
      options: [{ alwaysAwait: false }],
    },
    {
      code:
        'test("valid-expect", () => { return expect(Promise.resolve(2)).not.rejects.toBeDefined(); });',
      options: [{ alwaysAwait: false }],
    },

    {
      code:
        'test("valid-expect", function () { return expect(Promise.resolve(2)).not.resolves.toBeDefined(); });',
      options: [{ alwaysAwait: false }],
    },
    {
      code:
        'test("valid-expect", function () { return expect(Promise.resolve(2)).not.rejects.toBeDefined(); });',
      options: [{ alwaysAwait: false }],
    },

    'test("valid-expect", () => expect(Promise.resolve(2)).resolves.toBeDefined());',
    'test("valid-expect", () => expect(Promise.reject(2)).rejects.toBeDefined());',
    'test("valid-expect", () => expect(Promise.reject(2)).not.resolves.toBeDefined());',
    'test("valid-expect", () => expect(Promise.reject(2)).not.rejects.toBeDefined());',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).not.resolves.toBeDefined(); });',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).not.rejects.toBeDefined(); });',
    'test("valid-expect", async function () { await expect(Promise.reject(2)).not.resolves.toBeDefined(); });',
    'test("valid-expect", async function () { await expect(Promise.reject(2)).not.rejects.toBeDefined(); });',
  ],

  invalid: [
    {
      code: 'expect().toBe(true);',
      errors: [{ endColumn: 8, column: 7, messageId: 'noArgs' }],
    },
    {
      code: 'expect().toEqual("something");',
      errors: [{ endColumn: 8, column: 7, messageId: 'noArgs' }],
    },
    {
      code: 'expect("something", "else").toEqual("something");',
      errors: [{ endColumn: 26, column: 21, messageId: 'multipleArgs' }],
    },
    {
      code: 'expect("something");',
      errors: [{ endColumn: 20, column: 1, messageId: 'noAssertions' }],
    },
    {
      code: 'expect();',
      errors: [
        { endColumn: 9, column: 1, messageId: 'noAssertions' },
        { endColumn: 8, column: 7, messageId: 'noArgs' },
      ],
    },
    {
      code: 'expect(true).toBeDefined;',
      errors: [
        {
          endColumn: 25,
          column: 14,
          messageId: 'matcherOnPropertyNotCalled',
          data: { propertyName: 'toBeDefined' },
        },
      ],
    },
    {
      code: 'expect(true).not.toBeDefined;',
      errors: [
        {
          endColumn: 29,
          column: 18,
          messageId: 'matcherOnPropertyNotCalled',
          data: { propertyName: 'toBeDefined' },
        },
      ],
    },
    {
      code: 'expect(true).nope.toBeDefined;',
      errors: [
        {
          endColumn: 18,
          column: 14,
          messageId: 'invalidProperty',
          data: { propertyName: 'nope' },
        },
      ],
    },
    {
      code: 'expect(true).resolves;',
      errors: [
        {
          endColumn: 22,
          column: 14,
          messageId: 'propertyWithoutMatcher',
          data: { propertyName: 'resolves' },
        },
      ],
    },
    {
      code: 'expect(true).rejects;',
      errors: [
        {
          endColumn: 21,
          column: 14,
          messageId: 'propertyWithoutMatcher',
          data: { propertyName: 'rejects' },
        },
      ],
    },
    {
      code: 'expect(true).not;',
      errors: [
        {
          endColumn: 17,
          column: 14,
          messageId: 'propertyWithoutMatcher',
          data: { propertyName: 'not' },
        },
      ],
    },
    {
      code: 'expect(Promise.resolve(2)).resolves.toBeDefined();',
      errors: [
        {
          column: 1,
          endColumn: 50,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code:
        'test("valid-expect", () => { expect(Promise.resolve(2)).resolves.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 79,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code:
        'test("valid-expect", () => { expect(Promise.resolve(2)).not.resolves.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 83,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code:
        'test("valid-expect", () => { expect(Promise.resolve(2)).rejects.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 78,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code:
        'test("valid-expect", () => { expect(Promise.resolve(2)).not.rejects.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 82,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code:
        'test("valid-expect", async () => { expect(Promise.resolve(2)).resolves.toBeDefined(); });',
      errors: [
        {
          column: 36,
          endColumn: 85,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code:
        'test("valid-expect", async () => { expect(Promise.resolve(2)).not.resolves.toBeDefined(); });',
      errors: [
        {
          column: 36,
          endColumn: 89,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code: `test("valid-expect", async () => { 
          expect(Promise.resolve(2)).not.resolves.toBeDefined(); 
          expect(Promise.resolve(1)).rejects.toBeDefined(); 
        });`,
      errors: [
        {
          line: 2,
          column: 11,
          endColumn: 64,
          message: 'Async assertions must be awaited or returned.',
        },
        {
          line: 3,
          column: 11,
          endColumn: 59,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code: `test("valid-expect", async () => { 
          await expect(Promise.resolve(2)).not.resolves.toBeDefined(); 
          expect(Promise.resolve(1)).rejects.toBeDefined(); 
        });`,
      errors: [
        {
          line: 3,
          column: 11,
          endColumn: 59,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code: `test("valid-expect", async () => { 
          expect(Promise.resolve(2)).not.resolves.toBeDefined(); 
          return expect(Promise.resolve(1)).rejects.toBeDefined(); 
        });`,
      errors: [
        {
          line: 2,
          column: 11,
          endColumn: 64,
          message: 'Async assertions must be awaited or returned.',
        },
        {
          line: 3,
          column: 18,
          endColumn: 66,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code: `test("valid-expect", async () => { 
          expect(Promise.resolve(2)).not.resolves.toBeDefined(); 
          return expect(Promise.resolve(1)).rejects.toBeDefined(); 
        });`,
      options: [{ alwaysAwait: false }],
      errors: [
        {
          line: 2,
          column: 11,
          endColumn: 64,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
    {
      code: `test("valid-expect", async () => { 
          await expect(Promise.resolve(2)).not.resolves.toBeDefined(); 
          return expect(Promise.resolve(1)).rejects.toBeDefined(); 
        });`,
      errors: [
        {
          line: 3,
          column: 18,
          endColumn: 66,
          message: 'Async assertions must be awaited or returned.',
        },
      ],
    },
  ],
});
