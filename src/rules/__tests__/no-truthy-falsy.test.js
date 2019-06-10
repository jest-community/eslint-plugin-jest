'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-truthy-falsy');

const ruleTester = new RuleTester();

ruleTester.run('no-truthy-falsy', rule, {
  valid: [
    'expect(true).toBe(true);',
    'expect(false).toBe(false);',
    'expect("anything").toBe(true);',
    'expect("anything").toEqual(false);',
    'expect("anything").not.toBe(true);',
    'expect("anything").not.toEqual(true);',
    'expect(Promise.resolve({})).resolves.toBe(true);',
    'expect(Promise.reject({})).rejects.toBe(true);',
  ],

  invalid: [
    {
      code: 'expect(true).toBeTruthy();',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeTruthy' },
          column: 14,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(false).not.toBeTruthy();',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeTruthy' },
          column: 19,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).resolves.toBeTruthy()',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeTruthy' },
          column: 38,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).rejects.toBeTruthy()',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeTruthy' },
          column: 37,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(false).toBeFalsy();',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeFalsy' },
          column: 15,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(true).not.toBeFalsy();',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeFalsy' },
          column: 18,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).resolves.toBeFalsy()',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeFalsy' },
          column: 38,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).rejects.toBeFalsy()',
      errors: [
        {
          messageId: 'avoidMessage',
          data: { methodName: 'toBeFalsy' },
          column: 37,
          line: 1,
        },
      ],
    },
  ],
});
