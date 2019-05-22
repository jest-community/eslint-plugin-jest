'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-commented-out-tests');

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('no-commented-out-tests', rule, {
  valid: [
    '// foo("bar", function () {})',
    'describe("foo", function () {})',
    'it("foo", function () {})',
    'describe.only("foo", function () {})',
    'it.only("foo", function () {})',
    'test("foo", function () {})',
    'test.only("foo", function () {})',
    'var appliedSkip = describe.skip; appliedSkip.apply(describe)',
    'var calledSkip = it.skip; calledSkip.call(it)',
    '({ f: function () {} }).f()',
    '(a || b).f()',
    'itHappensToStartWithIt()',
    'testSomething()',
    '// latest(dates)',
    '// TODO: unify with Git implementation from Shipit (?)',
    [
      'import { pending } from "actions"',
      '',
      'test("foo", () => {',
      '  expect(pending()).toEqual({})',
      '})',
    ].join('\n'),
    [
      'const { pending } = require("actions")',
      '',
      'test("foo", () => {',
      '  expect(pending()).toEqual({})',
      '})',
    ].join('\n'),
    [
      'test("foo", () => {',
      '  const pending = getPending()',
      '  expect(pending()).toEqual({})',
      '})',
    ].join('\n'),
    [
      'test("foo", () => {',
      '  expect(pending()).toEqual({})',
      '})',
      '',
      'function pending() {',
      '  return {}',
      '}',
    ].join('\n'),
  ],

  invalid: [
    {
      code: '// describe("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// describe["skip"]("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// describe[\'skip\']("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// it.skip("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// it.only("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// it["skip"]("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// test.skip("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// test["skip"]("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// xdescribe("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// xit("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// fit("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// xtest("foo", function () {})',
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: `// test(
             //   "foo", function () {}
             // )`,
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: `/* test
              (
                "foo", function () {}
              )
              */`,
      errors: [
        { message: 'Some tests seem to be commented', column: 1, line: 1 },
      ],
    },
    {
      code: '// it("has title but no callback")',
      errors: [
        {
          message: 'Some tests seem to be commented',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: '// it()',
      errors: [
        {
          message: 'Some tests seem to be commented',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: '// test.someNewMethodThatMightBeAddedInTheFuture()',
      errors: [
        {
          message: 'Some tests seem to be commented',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: '// test["someNewMethodThatMightBeAddedInTheFuture"]()',
      errors: [
        {
          message: 'Some tests seem to be commented',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: '// test("has title but no callback")',
      errors: [
        {
          message: 'Some tests seem to be commented',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: `
      foo()
      /* 
      describe("has title but no callback", () => {}) 
      */
      bar()`,
      errors: [
        {
          message: 'Some tests seem to be commented',
          column: 7,
          line: 3,
        },
      ],
    },
  ],
});
