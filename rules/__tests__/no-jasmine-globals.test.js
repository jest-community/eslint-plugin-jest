'use strict';

const RuleTester = require('eslint').RuleTester;
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
  ],
  invalid: [
    {
      code: 'spyOn(some, "object")',
      errors: [
        {
          message: 'Avoid using global `spyOn`, prefer `jest.spyOn`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'spyOnProperty(some, "object")',
      errors: [
        {
          message: 'Avoid using global `spyOnProperty`, prefer `jest.spyOn`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'fail()',
      errors: [
        {
          message:
            'Avoid global `fail`, prefer throwing an error, or the `done` callback',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'pending()',
      errors: [
        {
          message: 'Avoid global `pending`, prefer explicitly skipping a test',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;',
      errors: [
        {
          message: 'Avoid using global `jasmine`',
          column: 1,
          line: 1,
        },
      ],
      output: 'jest.setTimeout(5000);',
    },
    {
      code: 'jasmine.addMatchers(matchers)',
      errors: [
        {
          message: 'Avoid using `jasmine.addMatchers`, prefer `expect.extend`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.createSpy()',
      errors: [
        {
          message: 'Avoid using `jasmine.createSpy`, prefer `jest.fn`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.any()',
      errors: [
        {
          message: 'Avoid using `jasmine.any`, prefer `expect.any`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.anything()',
      errors: [
        {
          message: 'Avoid using `jasmine.anything`, prefer `expect.anything`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.arrayContaining()',
      errors: [
        {
          message:
            'Avoid using `jasmine.arrayContaining`, prefer `expect.arrayContaining`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.objectContaining()',
      errors: [
        {
          message:
            'Avoid using `jasmine.objectContaining`, prefer `expect.objectContaining`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.stringMatching()',
      errors: [
        {
          message:
            'Avoid using `jasmine.stringMatching`, prefer `expect.stringMatching`',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.getEnv()',
      errors: [
        {
          message: 'Avoid using jasmine global',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.empty()',
      errors: [
        {
          message: 'Avoid using jasmine global',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.falsy()',
      errors: [
        {
          message: 'Avoid using jasmine global',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.truthy()',
      errors: [
        {
          message: 'Avoid using jasmine global',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.arrayWithExactContents()',
      errors: [
        {
          message: 'Avoid using jasmine global',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'jasmine.clock()',
      errors: [
        {
          message: 'Avoid using jasmine global',
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});
