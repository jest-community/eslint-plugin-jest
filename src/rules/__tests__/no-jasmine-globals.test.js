'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-jasmine-globals');

const ruleTester = new RuleTester();

ruleTester.run('no-jasmine-globals', rule, {
  valid: [
    'jest.spyOn()',
    'jest.fn()',
    'expect.extend()',
    'expect.any()',
    'it("foo", function () {})',
    'test("foo", function () {})',
    'foo()',
    `require('foo')('bar')`,
    'function callback(fail) { fail() }',
    'var spyOn = require("actions"); spyOn("foo")',
    'function callback(pending) { pending() }',
  ],
  invalid: [
    {
      code: 'spyOn(some, "object")',
      errors: [
        {
          messageId: 'illegalGlobal',
          data: { global: 'spyOn', replacement: 'jest.spyOn' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'spyOnProperty(some, "object")',
      errors: [
        {
          messageId: 'illegalGlobal',
          data: { global: 'spyOnProperty', replacement: 'jest.spyOn' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'fail()',
      errors: [{ messageId: 'illegalFail', column: 1, line: 1 }],
    },
    {
      code: 'pending()',
      errors: [{ messageId: 'illegalPending', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
      output: 'jest.setTimeout(5000);',
    },
    {
      code: 'jasmine.addMatchers(matchers)',
      errors: [
        {
          messageId: 'illegalMethod',
          data: { method: 'jasmine.addMatchers', replacement: 'expect.extend' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.createSpy()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: { method: 'jasmine.createSpy', replacement: 'jest.fn' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.any()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: { method: 'jasmine.any', replacement: 'expect.any' },
          column: 1,
          line: 1,
        },
      ],
      output: 'expect.any()',
    },
    {
      code: 'jasmine.anything()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: { method: 'jasmine.anything', replacement: 'expect.anything' },
          column: 1,
          line: 1,
        },
      ],
      output: 'expect.anything()',
    },
    {
      code: 'jasmine.arrayContaining()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: {
            method: 'jasmine.arrayContaining',
            replacement: 'expect.arrayContaining',
          },
          column: 1,
          line: 1,
        },
      ],
      output: 'expect.arrayContaining()',
    },
    {
      code: 'jasmine.objectContaining()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: {
            method: 'jasmine.objectContaining',
            replacement: 'expect.objectContaining',
          },
          column: 1,
          line: 1,
        },
      ],
      output: 'expect.objectContaining()',
    },
    {
      code: 'jasmine.stringMatching()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: {
            method: 'jasmine.stringMatching',
            replacement: 'expect.stringMatching',
          },
          column: 1,
          line: 1,
        },
      ],
      output: 'expect.stringMatching()',
    },
    {
      code: 'jasmine.getEnv()',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.empty()',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.falsy()',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.truthy()',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.arrayWithExactContents()',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.clock()',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.MAX_PRETTY_PRINT_ARRAY_LENGTH = 42',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
  ],
});
