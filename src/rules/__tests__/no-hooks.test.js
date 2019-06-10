'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-hooks');

const ruleTester = new RuleTester({
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
      options: [{ allow: ['afterEach', 'afterAll'] }],
    },
  ],
  invalid: [
    {
      code: 'beforeAll(() => {})',
      errors: [
        { messageId: 'unexpectedHook', data: { hookName: 'beforeAll' } },
      ],
    },
    {
      code: 'beforeEach(() => {})',
      errors: [
        { messageId: 'unexpectedHook', data: { hookName: 'beforeEach' } },
      ],
    },
    {
      code: 'afterAll(() => {})',
      errors: [{ messageId: 'unexpectedHook', data: { hookName: 'afterAll' } }],
    },
    {
      code: 'afterEach(() => {})',
      errors: [
        { messageId: 'unexpectedHook', data: { hookName: 'afterEach' } },
      ],
    },
    {
      code: 'beforeEach(() => {}); afterEach(() => { jest.resetModules() });',
      options: [{ allow: ['afterEach'] }],
      errors: [
        { messageId: 'unexpectedHook', data: { hookName: 'beforeEach' } },
      ],
    },
  ],
});
