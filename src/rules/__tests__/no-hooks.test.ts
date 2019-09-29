import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-hooks';
import { HookName } from '../utils';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('no-hooks', rule, {
  valid: [
    'test("foo")',
    'describe("foo", () => { it("bar") })',
    'test("foo", () => { expect(subject.beforeEach()).toBe(true) })',
    {
      code: 'afterEach(() => {}); afterAll(() => {});',
      options: [{ allow: [HookName.afterEach, HookName.afterAll] }],
    },
    { code: 'test("foo")', options: [{ allow: undefined }] },
  ],
  invalid: [
    {
      code: 'beforeAll(() => {})',
      errors: [
        { messageId: 'unexpectedHook', data: { hookName: HookName.beforeAll } },
      ],
    },
    {
      code: 'beforeEach(() => {})',
      errors: [
        {
          messageId: 'unexpectedHook',
          data: { hookName: HookName.beforeEach },
        },
      ],
    },
    {
      code: 'afterAll(() => {})',
      errors: [
        { messageId: 'unexpectedHook', data: { hookName: HookName.afterAll } },
      ],
    },
    {
      code: 'afterEach(() => {})',
      errors: [
        { messageId: 'unexpectedHook', data: { hookName: HookName.afterEach } },
      ],
    },
    {
      code: 'beforeEach(() => {}); afterEach(() => { jest.resetModules() });',
      options: [{ allow: [HookName.afterEach] }],
      errors: [
        {
          messageId: 'unexpectedHook',
          data: { hookName: HookName.beforeEach },
        },
      ],
    },
  ],
});
