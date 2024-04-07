import dedent from 'dedent';
import rule from '../prefer-hooks-on-top';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
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
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          beforeEach(() => {});
          test.each\`\`('bar', () => {
            someFn();
          });

          beforeAll(() => {});
          test.only('bar', () => {
            someFn();
          });
        });
      `,
      errors: [
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          beforeEach(() => {});
          test.only.each\`\`('bar', () => {
            someFn();
          });

          beforeAll(() => {});
          test.only('bar', () => {
            someFn();
          });
        });
      `,
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
          line: 7,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 27,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 28,
        },
        {
          messageId: 'noHookOnTop',
          column: 3,
          line: 29,
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
          line: 17,
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
