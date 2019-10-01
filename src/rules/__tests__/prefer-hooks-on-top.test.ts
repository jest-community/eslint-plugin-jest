import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../prefer-hooks-on-top';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('basic describe block', rule, {
  valid: [
    `describe("foo" () => {
        beforeEach(() => {
        });
        someSetupFn();
        afterEach(() => {
        });
        test("bar" () => {
          some_fn();
        });
      });`,
  ],
  invalid: [
    {
      code: `describe("foo", () => {
          beforeEach(() => {
          });
          test("bar", () => {
            some_fn();
          });
          beforeAll(() => {
          });
          test("bar", () => {
            some_fn();
          });
        });`,
      errors: [
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 7,
        },
      ],
    },
  ],
});

ruleTester.run('multiple describe blocks', rule, {
  valid: [
    `describe.skip("foo" () => {
        beforeEach(() => {
        });
        beforeAll(() => {
        });
        test("bar" () => {
          some_fn();
        });
      });
      describe("foo" () => {
        beforeEach(() => {
        });
        test("bar" () => {
          some_fn();
        });
      });`,
  ],

  invalid: [
    {
      code: `describe.skip("foo" () => {
          beforeEach(() => {
          });
          test("bar" () => {
            some_fn();
          });
          beforeAll(() => {
          });
          test("bar" () => {
            some_fn();
          });
        });
        describe("foo" () => {
          beforeEach(() => {
          });
          beforeEach(() => {
          });
          beforeAll(() => {
          });
          test("bar" () => {
            some_fn();
          });
        });
        describe("foo" () => {
          test("bar" () => {
            some_fn();
          });
          beforeEach(() => {
          });
          beforeEach(() => {
          });
          beforeAll(() => {
          });
        });`,
      errors: [
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 7,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 28,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 30,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 32,
        },
      ],
    },
  ],
});

ruleTester.run('nested describe blocks', rule, {
  valid: [
    `describe("foo" () => {
        beforeEach(() => {
        });
        test("bar" () => {
          some_fn();
        });
        describe("inner_foo" () => {
          beforeEach(() => {
          });
          test("inner bar" () => {
            some_fn();
          });
        });
      });`,
  ],

  invalid: [
    {
      code: `describe("foo" () => {
          beforeAll(() => {
          });
          test("bar" () => {
            some_fn();
          });
          describe("inner_foo" () => {
            beforeEach(() => {
            });
            test("inner bar" () => {
              some_fn();
            });
            test("inner bar" () => {
              some_fn();
            });
            beforeAll(() => {
            });
            afterAll(() => {
            });
            test("inner bar" () => {
              some_fn();
            });
          });
        });`,
      errors: [
        {
          messageId: 'noHookOnTop',
          column: 5,
          line: 16,
        },
        {
          messageId: 'noHookOnTop',
          column: 5,
          line: 18,
        },
      ],
    },
  ],
});
