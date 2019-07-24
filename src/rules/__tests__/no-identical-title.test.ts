import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-identical-title';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('no-identical-title', rule, {
  valid: [
    [
      'describe("describe", function() {',
      '   it("it", function() {});',
      '});',
    ].join('\n'),
    ['describe();describe();'].join('\n'),
    ['it();it();'].join('\n'),
    [
      'describe("describe1", function() {',
      '   it("it1", function() {});',
      '   it("it2", function() {});',
      '});',
    ].join('\n'),
    ['it("it1", function() {});', 'it("it2", function() {});'].join('\n'),
    ['it.only("it1", function() {});', 'it("it2", function() {});'].join('\n'),
    ['it.only("it1", function() {});', 'it.only("it2", function() {});'].join(
      '\n',
    ),
    ['describe("title", function() {});', 'it("title", function() {});'].join(
      '\n',
    ),
    [
      'describe("describe1", function() {',
      '   it("it1", function() {});',
      '   describe("describe2", function() {',
      '       it("it1", function() {});',
      '   });',
      '});',
    ].join('\n'),
    [
      'describe("describe1", function() {',
      '   describe("describe2", function() {',
      '       it("it1", function() {});',
      '   });',
      '   it("it1", function() {});',
      '});',
    ].join('\n'),
    [
      'describe("describe1", function() {',
      '   describe("describe2", function() {});',
      '});',
    ].join('\n'),
    [
      'describe("describe1", function() {',
      '   describe("describe2", function() {});',
      '});',
      'describe("describe2", function() {});',
    ].join('\n'),
    [
      'describe("describe1", function() {});',
      'describe("describe2", function() {});',
    ].join('\n'),
    ['it("it" + n, function() {});', 'it("it" + n, function() {});'].join('\n'),
    ['it(`it${n}`, function() {});', 'it(`it${n}`, function() {});'].join('\n'),
    'it(`${n}`, function() {});',
    [
      'describe("title " + foo, function() {',
      '    describe("describe1", function() {});',
      '});',
      'describe("describe1", function() {});',
    ].join('\n'),
    [
      'describe("describe1", function() {',
      '    describe("describe2", function() {});',
      '    describe("title " + foo, function() {',
      '        describe("describe2", function() {});',
      '    });',
      '});',
    ].join('\n'),
    [
      'describe("describe", () => {',
      '    it(`testing ${someVar} with the same title`, () => {});',
      '    it(`testing ${someVar} with the same title`, () => {});',
      '});',
    ].join('\n'),
    ['it(`it1`, () => {});', 'it(`it2`, () => {});'].join('\n'),
    [
      'describe(`describe1`, () => {});',
      'describe(`describe2`, () => {});',
    ].join('\n'),
    [
      'const test = { content: () => "foo" }',
      'test.content(`testing backticks with the same title`);',
      'test.content(`testing backticks with the same title`);',
    ].join('\n'),
    [
      'const describe = { content: () => "foo" }',
      'describe.content(`testing backticks with the same title`);',
      'describe.content(`testing backticks with the same title`);',
    ].join('\n'),
  ],
  invalid: [
    {
      code: [
        'describe("describe1", function() {',
        '   it("it1", function() {});',
        '   it("it1", function() {});',
        '});',
      ].join('\n'),
      errors: [{ messageId: 'multipleTestTitle', column: 4, line: 3 }],
    },
    {
      code: ['it("it1", function() {});', 'it("it1", function() {});'].join(
        '\n',
      ),
      errors: [{ messageId: 'multipleTestTitle', column: 1, line: 2 }],
    },
    {
      code: [
        'it.only("it1", function() {});',
        'it("it1", function() {});',
      ].join('\n'),
      errors: [{ messageId: 'multipleTestTitle', column: 1, line: 2 }],
    },
    {
      code: ['fit("it1", function() {});', 'it("it1", function() {});'].join(
        '\n',
      ),
      errors: [{ messageId: 'multipleTestTitle', column: 1, line: 2 }],
    },
    {
      code: [
        'it.only("it1", function() {});',
        'it.only("it1", function() {});',
      ].join('\n'),
      errors: [{ messageId: 'multipleTestTitle', column: 1, line: 2 }],
    },
    {
      code: [
        'describe("describe1", function() {});',
        'describe("describe1", function() {});',
      ].join('\n'),
      errors: [{ messageId: 'multipleDescribeTitle', column: 1, line: 2 }],
    },
    {
      code: [
        'describe("describe1", function() {});',
        'xdescribe("describe1", function() {});',
      ].join('\n'),
      errors: [{ messageId: 'multipleDescribeTitle', column: 1, line: 2 }],
    },
    {
      code: [
        'fdescribe("describe1", function() {});',
        'describe("describe1", function() {});',
      ].join('\n'),
      errors: [{ messageId: 'multipleDescribeTitle', column: 1, line: 2 }],
    },
    {
      code: [
        'describe("describe1", function() {',
        '   describe("describe2", function() {});',
        '});',
        'describe("describe1", function() {});',
      ].join('\n'),
      errors: [{ messageId: 'multipleDescribeTitle', column: 1, line: 4 }],
    },
    {
      code: [
        'describe("describe", () => {',
        '    it(`testing backticks with the same title`, () => {});',
        '    it(`testing backticks with the same title`, () => {});',
        '});',
      ].join('\n'),
      errors: [{ messageId: 'multipleTestTitle', column: 5, line: 3 }],
    },
  ],
});
