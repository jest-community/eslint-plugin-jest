import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-test-return-statement';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: { ecmaVersion: 2015 },
});

ruleTester.run('no-test-prefixes', rule, {
  valid: [
    'it("noop", function () {});',
    'test("noop", () => {});',
    'test("one", () => expect(1).toBe(1));',
    'test("empty")',
    `
    test("one", () => {
      expect(1).toBe(1);
    });
    `,
    `
    it("one", function () {
      expect(1).toBe(1);
    });
    `,
  ],
  invalid: [
    {
      code: `
      test("one", () => {
        return expect(1).toBe(1);
      });
      `,
      errors: [{ messageId: 'noReturnValue', column: 9, line: 3 }],
    },
    {
      code: `
      it("one", function () {
        return expect(1).toBe(1);
      });
      `,
      errors: [{ messageId: 'noReturnValue', column: 9, line: 3 }],
    },
  ],
});
