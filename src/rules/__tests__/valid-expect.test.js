'use strict';

const { RuleTester } = require('eslint');
const rule = require('../valid-expect');

const ruleTester = new RuleTester();

ruleTester.run('valid-expect', rule, {
  valid: [
    'expect("something").toEqual("else");',
    'expect(true).toBeDefined();',
    'expect([1, 2, 3]).toEqual([1, 2, 3]);',
    'expect(undefined).not.toBeDefined();',
    'expect(Promise.resolve(2)).resolves.toBeDefined();',
    'expect(Promise.reject(2)).rejects.toBeDefined();',
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
  ],
});
