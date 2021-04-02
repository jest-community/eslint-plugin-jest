import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../no-duplicate-hooks';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('basic describe block', rule, {
  valid: [
    dedent`
      describe("foo", () => {
        beforeEach(() => {})
        test("bar", () => {
          someFn();
        })
      })
    `,
    dedent`
      beforeEach(() => {})
      test("bar", () => {
        someFn();
      })
    `,
    dedent`
      describe("foo", () => {
        beforeAll(() => {}),
        beforeEach(() => {})
        afterEach(() => {})
        afterAll(() => {})

        test("bar", () => {
          someFn();
        })
      })
    `,
  ],

  invalid: [
    {
      code: dedent`
        describe("foo", () => {
          beforeEach(() => {}),
          beforeEach(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          beforeEach(() => {}),
          beforeAll(() => {}),
          beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeAll' },
          column: 3,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          afterEach(() => {}),
          afterEach(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterEach' },
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          afterAll(() => {}),
          afterAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterAll' },
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {}),
        afterAll(() => {}),
        test("bar", () => {
          someFn();
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterAll' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        describe("foo", () => {
          beforeEach(() => {}),
          beforeEach(() => {}),
          beforeEach(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 3,
        },
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          afterAll(() => {}),
          afterAll(() => {}),
          beforeAll(() => {}),
          beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterAll' },
          column: 3,
          line: 3,
        },
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeAll' },
          column: 3,
          line: 5,
        },
      ],
    },
  ],
});

ruleTester.run('multiple describe blocks', rule, {
  valid: [
    dedent`
      describe.skip("foo", () => {
        beforeEach(() => {}),
        beforeAll(() => {}),
        test("bar", () => {
          someFn();
        })
      })
      describe("foo", () => {
        beforeEach(() => {}),
        beforeAll(() => {}),
        test("bar", () => {
          someFn();
        })
      })
    `,
  ],

  invalid: [
    {
      code: dedent`
        describe.skip("foo", () => {
          beforeEach(() => {}),
          beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
        describe("foo", () => {
          beforeEach(() => {}),
          beforeEach(() => {}),
          beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 10,
        },
      ],
    },
  ],
});

ruleTester.run('nested describe blocks', rule, {
  valid: [
    dedent`
      describe("foo", () => {
        beforeEach(() => {}),
        test("bar", () => {
          someFn();
        })
        describe("inner_foo", () => {
          beforeEach(() => {})
          test("inner bar", () => {
            someFn();
          })
        })
      })
    `,
  ],

  invalid: [
    {
      code: dedent`
        describe("foo", () => {
          beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
          describe("inner_foo", () => {
            beforeEach(() => {})
            beforeEach(() => {})
            test("inner bar", () => {
              someFn();
            })
          })
        })
      `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 5,
          line: 8,
        },
      ],
    },
  ],
});

ruleTester.run('describe.each blocks', rule, {
  valid: [
    dedent`
      describe.each(['hello'])('%s', () => {
        beforeEach(() => {});

        it('is fine', () => {});
      });
    `,
    dedent`
      describe('something', () => {
        describe.each(['hello'])('%s', () => {
          beforeEach(() => {});

          it('is fine', () => {});
        });

        describe.each(['world'])('%s', () => {
          beforeEach(() => {});

          it('is fine', () => {});
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        beforeEach(() => {});

        it('is fine', () => {});
      });
    `,
    dedent`
      describe('something', () => {
        describe.each\`\`('%s', () => {
          beforeEach(() => {});

          it('is fine', () => {});
        });

        describe.each\`\`('%s', () => {
          beforeEach(() => {});

          it('is fine', () => {});
        });
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
      describe.each(['hello'])('%s', () => {
        beforeEach(() => {});
        beforeEach(() => {});

        it('is not fine', () => {});
      });
    `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
      describe('something', () => {
        describe.each(['hello'])('%s', () => {
          beforeEach(() => {});

          it('is fine', () => {});
        });

        describe.each(['world'])('%s', () => {
          beforeEach(() => {});
          beforeEach(() => {});

          it('is not fine', () => {});
        });
      });
    `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 5,
          line: 10,
        },
      ],
    },
    {
      code: dedent`
      describe('something', () => {
        describe.each(['hello'])('%s', () => {
          beforeEach(() => {});

          it('is fine', () => {});
        });

        describe.each(['world'])('%s', () => {
          describe('some more', () => {
            beforeEach(() => {});
            beforeEach(() => {});

            it('is not fine', () => {});
          });
        });
      });
    `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 7,
          line: 11,
        },
      ],
    },
    {
      code: dedent`
      describe.each\`\`('%s', () => {
        beforeEach(() => {});
        beforeEach(() => {});

        it('is fine', () => {});
      });
    `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
      describe('something', () => {
        describe.each\`\`('%s', () => {
          beforeEach(() => {});

          it('is fine', () => {});
        });

        describe.each\`\`('%s', () => {
          beforeEach(() => {});
          beforeEach(() => {});

          it('is not fine', () => {});
        });
      });
    `,
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 5,
          line: 10,
        },
      ],
    },
  ],
});
