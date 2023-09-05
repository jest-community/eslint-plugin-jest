import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../no-confusing-set-timeout';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2020,
  },
});

ruleTester.run('no-confusing-set-timeout', rule, {
  valid: [
    dedent`
      jest.setTimeout(1000);
      describe('A', () => {
        beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
      });
    `,
    dedent`
      jest.setTimeout(1000);
      window.setTimeout(6000)
      describe('A', () => {
        beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        it('test foo', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
      });
    `,
    {
      code: dedent`
        import { handler } from 'dep/mod';
        jest.setTimeout(800);
        describe('A', () => {
          beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        });
      `,
      parserOptions: { sourceType: 'module' },
    },
    dedent`
      function handler() {}
      jest.setTimeout(800);
      describe('A', () => {
        beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
      });
    `,
    dedent`
      const { handler } = require('dep/mod');
      jest.setTimeout(800);
      describe('A', () => {
        beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
      });
    `,
    dedent`
      jest.setTimeout(1000);
      window.setTimeout(60000);
    `,
    'window.setTimeout(60000);',
    'setTimeout(1000);',
    dedent`
      jest.setTimeout(1000);
      test('test case', () => {
        setTimeout(() => {
          Promise.resolv();
        }, 5000);
      });
    `,
    dedent`
      test('test case', () => {
        setTimeout(() => {
          Promise.resolv();
        }, 5000);
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        jest.setTimeout(1000);
        setTimeout(1000);
        window.setTimeout(1000);
        describe('A', () => {
          beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        });
        jest.setTimeout(800);
      `,
      errors: [
        {
          messageId: 'orderSetTimeout',
          line: 9,
          column: 1,
        },
        {
          messageId: 'multipleSetTimeouts',
          line: 9,
          column: 1,
        },
      ],
    },
    {
      code: dedent`
        describe('A', () => {
          jest.setTimeout(800);
          beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        });
      `,
      errors: [
        {
          messageId: 'globalSetTimeout',
          line: 2,
          column: 3,
        },
        {
          messageId: 'orderSetTimeout',
          line: 2,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('B', () => {
          it('B.1', async () => {
            await new Promise((resolve) => {
              jest.setTimeout(1000);
              setTimeout(resolve, 10000).unref();
            });
          });
          it('B.2', async () => {
            await new Promise((resolve) => { setTimeout(resolve, 10000).unref(); });
          });
        });
      `,
      errors: [
        {
          messageId: 'globalSetTimeout',
          line: 4,
          column: 7,
        },
        {
          messageId: 'orderSetTimeout',
          line: 4,
          column: 7,
        },
      ],
    },
    {
      code: dedent`
        test('test-suite', () => {
          jest.setTimeout(1000);
        });
      `,
      errors: [
        {
          messageId: 'globalSetTimeout',
          line: 2,
          column: 3,
        },
        {
          messageId: 'orderSetTimeout',
          line: 2,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('A', () => {
          beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        });
        jest.setTimeout(1000);
      `,
      errors: [
        {
          messageId: 'orderSetTimeout',
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: dedent`
        import { jest } from '@jest/globals';
        {
          jest.setTimeout(800);
        }
        describe('A', () => {
          beforeEach(async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.1', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
          it('A.2', async () => { await new Promise(resolve => { setTimeout(resolve, 10000).unref(); });});
        });
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'globalSetTimeout',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        jest.setTimeout(800);
        jest.setTimeout(900);
      `,
      errors: [
        {
          messageId: 'multipleSetTimeouts',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: dedent`
        expect(1 + 2).toEqual(3);
        jest.setTimeout(800);
      `,
      errors: [
        {
          messageId: 'orderSetTimeout',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
});
