import rule from '../no-jasmine-globals';
import { FlatCompatRuleTester } from './test-utils';

const ruleTester = new FlatCompatRuleTester();

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
    '(function(){})()',
    'function callback(fail) { fail() }',
    'var spyOn = require("actions"); spyOn("foo")',
    'function callback(pending) { pending() }',
  ],
  invalid: [
    {
      code: 'spyOn(some, "object")',
      output: null,
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
      output: null,
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
      output: null,
      errors: [{ messageId: 'illegalFail', column: 1, line: 1 }],
    },
    {
      code: 'pending()',
      output: null,
      errors: [{ messageId: 'illegalPending', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;',
      output: 'jest.setTimeout(5000);',
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.DEFAULT_TIMEOUT_INTERVAL = function() {}',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.addMatchers(matchers)',
      output: null,
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
      output: null,
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
      output: 'expect.any()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: { method: 'jasmine.any', replacement: 'expect.any' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.anything()',
      output: 'expect.anything()',
      errors: [
        {
          messageId: 'illegalMethod',
          data: { method: 'jasmine.anything', replacement: 'expect.anything' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.arrayContaining()',
      output: 'expect.arrayContaining()',
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
    },
    {
      code: 'jasmine.objectContaining()',
      output: 'expect.objectContaining()',
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
    },
    {
      code: 'jasmine.stringMatching()',
      output: 'expect.stringMatching()',
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
    },
    {
      code: 'jasmine.getEnv()',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.empty()',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.falsy()',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.truthy()',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.arrayWithExactContents()',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.clock()',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
    {
      code: 'jasmine.MAX_PRETTY_PRINT_ARRAY_LENGTH = 42',
      output: null,
      errors: [{ messageId: 'illegalJasmine', column: 1, line: 1 }],
    },
  ],
});
