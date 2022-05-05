import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import rule from '../prefer-hooks-in-order';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-hooks-in-order', rule, {
  valid: [
    'beforeAll(() => {})',
    'beforeEach(() => {})',
    'afterEach(() => {})',
    'afterAll(() => {})',
    dedent`
      beforeAll(() => {});
      beforeEach(() => {});
      afterEach(() => {});
      afterAll(() => {});
    `,
    dedent`
      describe('foo', () => {
        someSetupFn();
        beforeEach(() => {});
        afterEach(() => {});

        test('bar', () => {
          someFn();
        });
      });
    `,
    dedent`
      beforeAll(() => {});
      afterAll(() => {});
    `,
    dedent`
      beforeEach(() => {});
      afterEach(() => {});
    `,
    dedent`
      beforeAll(() => {});
      afterEach(() => {});
    `,
    dedent`
      beforeAll(() => {});
      beforeEach(() => {});
    `,
    dedent`
      afterEach(() => {});
      afterAll(() => {});
    `,
    dedent`
      describe('my test', () => {
        afterEach(() => {});
        afterAll(() => {});
      });
    `,
    dedent`
      describe('my test', () => {
        afterEach(() => {});
        afterAll(() => {});

        doSomething();

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
    dedent`
      describe('my test', () => {
        afterEach(() => {});
        afterAll(() => {});

        it('is a test', () => {});

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
    dedent`
      describe('my test', () => {
        afterAll(() => {});

        describe('when something is true', () => {
          beforeAll(() => {});
          beforeEach(() => {});
        });
      });
    `,
    dedent`
      describe('my test', () => {
        afterAll(() => {});

        describe('when something is true', () => {
          beforeAll(() => {});
          beforeEach(() => {});

          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });

      describe('my test', () => {
        beforeAll(() => {});
        beforeEach(() => {});
        afterAll(() => {});

        describe('when something is true', () => {
          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
    dedent`
      const withDatabase = () => {
        beforeAll(() => {
          createMyDatabase();
        });
        afterAll(() => {
          removeMyDatabase();
        });
      };

      describe('my test', () => {
        withDatabase();

        afterAll(() => {});

        describe('when something is true', () => {
          beforeAll(() => {});
          beforeEach(() => {});

          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });

      describe('my test', () => {
        beforeAll(() => {});
        beforeEach(() => {});
        afterAll(() => {});

        withDatabase();

        describe('when something is true', () => {
          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        const withDatabase = () => {
          afterAll(() => {
            removeMyDatabase();
          });
          beforeAll(() => {
            createMyDatabase();
          });
        };
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          column: 3,
          line: 5,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {
          removeMyDatabase();
        });
        beforeAll(() => {
          createMyDatabase();
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          column: 1,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {});
        beforeAll(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterEach(() => {});
        beforeEach(() => {});
      `,
      errors: [
        {
          // 'beforeEach' hooks should be before any 'afterEach' hooks
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeEach', previousHook: 'afterEach' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterEach(() => {});
        beforeAll(() => {});
      `,
      errors: [
        {
          // 'beforeAll' hooks should be before any 'afterEach' hooks
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterEach' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        beforeEach(() => {});
        beforeAll(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {});
        afterEach(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {});
        afterAll(() => {});
        afterEach(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});
          afterEach(() => {});
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});
          afterEach(() => {});

          doSomething();

          beforeEach(() => {});
          beforeAll(() => {});
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 3,
          line: 3,
        },
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 3,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});
          afterEach(() => {});

          it('is a test', () => {});

          beforeEach(() => {});
          beforeAll(() => {});
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 3,
          line: 3,
        },
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 3,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});

          describe('when something is true', () => {
            beforeEach(() => {});
            beforeAll(() => {});
          });
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 5,
          line: 6,
        },
      ],
    },
  ],
});
