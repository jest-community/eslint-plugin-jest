import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../prefer-hooks-on-top';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('basic describe block', rule, {
  valid: [
    dedent`
      describe('foo', () => {
        beforeEach(() => {});
        someSetupFn();
        afterEach(() => {});
        test('bar', () => {
          someFn();
        });
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        describe('foo', () => {
          beforeEach(() => {});
          test('bar', () => {
            someFn();
          });
          beforeAll(() => {});
          test('bar', () => {
            someFn();
          });
        });
      `,
      errors: [
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 6,
        },
      ],
    },
  ],
});

ruleTester.run('multiple describe blocks', rule, {
  valid: [
    dedent`
      describe.skip('foo', () => {
        beforeEach(() => {});
        beforeAll(() => {});
        test('bar', () => {
          someFn();
        });
      });
      describe('foo', () => {
        beforeEach(() => {});
        test('bar', () => {
          someFn();
        });
      });
    `,
  ],

  invalid: [
    {
      code: dedent`
        describe.skip('foo', () => {
          beforeEach(() => {});
          test('bar', () => {
            someFn();
          });
          beforeAll(() => {});
          test('bar', () => {
            someFn();
          });
        });
        describe('foo', () => {
          beforeEach(() => {});
          beforeEach(() => {});
          beforeAll(() => {});
          test('bar', () => {
            someFn();
          });
        });
        describe('foo', () => {
          test('bar', () => {
            someFn();
          });
          beforeEach(() => {});
          beforeEach(() => {});
          beforeAll(() => {});
        });
      `,
      errors: [
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 6,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 23,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 24,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 25,
        },
      ],
    },
  ],
});

ruleTester.run('nested describe blocks', rule, {
  valid: [
    dedent`
      describe('foo', () => {
        beforeEach(() => {});
        test('bar', () => {
          someFn();
        });
        describe('inner_foo', () => {
          beforeEach(() => {});
          test('inner bar', () => {
            someFn();
          });
        });
      });
    `,
  ],

  invalid: [
    {
      code: dedent`
        describe('foo', () => {
          beforeAll(() => {});
          test('bar', () => {
            someFn();
          });
          describe('inner_foo', () => {
            beforeEach(() => {});
            test('inner bar', () => {
              someFn();
            });
            test('inner bar', () => {
              someFn();
            });
            beforeAll(() => {});
            afterAll(() => {});
            test('inner bar', () => {
              someFn();
            });
          });
        });
      `,
      errors: [
        {
          messageId: 'noHookOnTop',
          column: 5,
          line: 14,
        },
        {
          messageId: 'noHookOnTop',
          column: 5,
          line: 15,
        },
      ],
    },
  ],
});
