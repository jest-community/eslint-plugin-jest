import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../no-hooks';
import { HookName } from '../utils';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
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
    {
      code: dedent`
        import { beforeEach as afterEach, afterEach as beforeEach } from '@jest/globals';

        afterEach(() => {});
        beforeEach(() => { jest.resetModules() });
      `,
      options: [{ allow: [HookName.afterEach] }],
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'unexpectedHook',
          data: { hookName: HookName.beforeEach },
        },
      ],
    },
  ],
});
