import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../no-test-return-statement';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: { ecmaVersion: 2015 },
});

ruleTester.run('no-test-return-statement', rule, {
  valid: [
    'it("noop", function () {});',
    'test("noop", () => {});',
    'test("one", () => expect(1).toBe(1));',
    'test("empty")',
    dedent`
      test("one", () => {
        expect(1).toBe(1);
      });
    `,
    dedent`
      it("one", function () {
        expect(1).toBe(1);
      });
    `,
    dedent`
      it("one", myTest);
      function myTest() {
        expect(1).toBe(1);
      }
    `,
    dedent`
      it("one", () => expect(1).toBe(1));
      function myHelper() {}
    `,
  ],
  invalid: [
    {
      code: dedent`
        test("one", () => {
          return expect(1).toBe(1);
        });
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 2 }],
    },
    {
      code: dedent`
        it("one", function () {
          return expect(1).toBe(1);
        });
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 2 }],
    },
    {
      code: dedent`
        it.skip("one", function () {
          return expect(1).toBe(1);
        });
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 2 }],
    },
    {
      code: dedent`
        it.each\`\`("one", function () {
          return expect(1).toBe(1);
        });
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 2 }],
    },
    {
      code: dedent`
        it.each()("one", function () {
          return expect(1).toBe(1);
        });
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 2 }],
    },
    {
      code: dedent`
        it.only.each\`\`("one", function () {
          return expect(1).toBe(1);
        });
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 2 }],
    },
    {
      code: dedent`
        it.only.each()("one", function () {
          return expect(1).toBe(1);
        });
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 2 }],
    },
    {
      code: dedent`
        it("one", myTest);
        function myTest () {
          return expect(1).toBe(1);
        }
      `,
      errors: [{ messageId: 'noReturnValue', column: 3, line: 3 }],
    },
  ],
});
