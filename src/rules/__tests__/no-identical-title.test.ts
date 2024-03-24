import dedent from 'dedent';
import rule from '../no-identical-title';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('no-identical-title', rule, {
  valid: [
    'it(); it();',
    'describe(); describe();',
    'describe("foo", () => {}); it("foo", () => {});',
    dedent`
      describe("foo", () => {
        it("works", () => {});
      });
    `,
    dedent`
      it('one', () => {});
      it('two', () => {});
    `,
    dedent`
      describe('foo', () => {});
      describe('foe', () => {});
    `,
    dedent`
      it(\`one\`, () => {});
      it(\`two\`, () => {});
    `,
    dedent`
      describe(\`foo\`, () => {});
      describe(\`foe\`, () => {});
    `,
    dedent`
      describe('foo', () => {
        test('this', () => {});
        test('that', () => {});
      });
    `,
    dedent`
      test.concurrent('this', () => {});
      test.concurrent('that', () => {});
    `,
    dedent`
      test.concurrent('this', () => {});
      test.only.concurrent('that', () => {});
    `,
    dedent`
      test.only.concurrent('this', () => {});
      test.concurrent('that', () => {});
    `,
    dedent`
      test.only.concurrent('this', () => {});
      test.only.concurrent('that', () => {});
    `,
    dedent`
      test.only('this', () => {});
      test.only('that', () => {});
    `,
    dedent`
      describe('foo', () => {
        it('works', () => {});

        describe('foe', () => {
          it('works', () => {});
        });
      });
    `,
    dedent`
      describe('foo', () => {
        describe('foe', () => {
          it('works', () => {});
        });

        it('works', () => {});
      });
    `,
    "describe('foo', () => describe('foe', () => {}));",
    dedent`
      describe('foo', () => {
        describe('foe', () => {});
      });

      describe('foe', () => {});
    `,
    'test("number" + n, function() {});',
    'test("number" + n, function() {}); test("number" + n, function() {});',
    'it(`${n}`, function() {});',
    'it(`${n}`, function() {}); it(`${n}`, function() {});',
    dedent`
      describe('a class named ' + myClass.name, () => {
        describe('#myMethod', () => {});
      });

      describe('something else', () => {});
    `,
    dedent`
      describe('my class', () => {
        describe('#myMethod', () => {});
        describe('a class named ' + myClass.name, () => {});
      });
    `,
    dedent`
      describe("foo", () => {
        it(\`ignores $\{someVar} with the same title\`, () => {});
        it(\`ignores $\{someVar} with the same title\`, () => {});
      });
    `.replace(/\\\{/u, '{'),
    dedent`
      const test = { content: () => "foo" };
      test.content(\`something that is not from jest\`, () => {});
      test.content(\`something that is not from jest\`, () => {});
    `,
    dedent`
      const describe = { content: () => "foo" };
      describe.content(\`something that is not from jest\`, () => {});
      describe.content(\`something that is not from jest\`, () => {});
    `,
    dedent`
      describe.each\`
        description
        $\{'b'}
      \`('$description', () => {});

      describe.each\`
        description
        $\{'a'}
      \`('$description', () => {});
    `,
    dedent`
      describe('top level', () => {
        describe.each\`\`('nested each', () => {
          describe.each\`\`('nested nested each', () => {});
        });

        describe('nested', () => {});
      });
    `,
    dedent`
      describe.each\`\`('my title', value => {});
      describe.each\`\`('my title', value => {});
      describe.each([])('my title', value => {});
      describe.each([])('my title', value => {});
    `,
    dedent`
      describe.each([])('when the value is %s', value => {});
      describe.each([])('when the value is %s', value => {});
    `,
  ],
  invalid: [
    {
      code: dedent`
        describe('foo', () => {
          it('works', () => {});
          it('works', () => {});
        });
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 6, line: 3 }],
    },
    {
      code: dedent`
        it('works', () => {});
        it('works', () => {});
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 4, line: 2 }],
    },
    {
      code: dedent`
        test.only('this', () => {});
        test('this', () => {});
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 6, line: 2 }],
    },
    {
      code: dedent`
        xtest('this', () => {});
        test('this', () => {});
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 6, line: 2 }],
    },
    {
      code: dedent`
        test.only('this', () => {});
        test.only('this', () => {});
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 11, line: 2 }],
    },
    {
      code: dedent`
        test.concurrent('this', () => {});
        test.concurrent('this', () => {});
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 17, line: 2 }],
    },
    {
      code: dedent`
        test.only('this', () => {});
        test.concurrent('this', () => {});
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 17, line: 2 }],
    },
    {
      code: dedent`
        describe('foo', () => {});
        describe('foo', () => {});
      `,
      errors: [{ messageId: 'multipleDescribeTitle', column: 10, line: 2 }],
    },
    {
      code: dedent`
        describe('foo', () => {});
        xdescribe('foo', () => {});
      `,
      errors: [{ messageId: 'multipleDescribeTitle', column: 11, line: 2 }],
    },
    {
      code: dedent`
        fdescribe('foo', () => {});
        describe('foo', () => {});
      `,
      errors: [{ messageId: 'multipleDescribeTitle', column: 10, line: 2 }],
    },
    {
      code: dedent`
        describe('foo', () => {
          describe('foe', () => {});
        });
        describe('foo', () => {});
      `,
      errors: [{ messageId: 'multipleDescribeTitle', column: 10, line: 4 }],
    },
    {
      code: dedent`
        describe("foo", () => {
          it(\`catches backticks with the same title\`, () => {});
          it(\`catches backticks with the same title\`, () => {});
        });
      `,
      errors: [{ messageId: 'multipleTestTitle', column: 6, line: 3 }],
    },
    {
      code: dedent`
        context('foo', () => {
          describe('foe', () => {});
        });
        describe('foo', () => {});
      `,
      errors: [{ messageId: 'multipleDescribeTitle', column: 10, line: 4 }],
      settings: { jest: { globalAliases: { describe: ['context'] } } },
    },
  ],
});
