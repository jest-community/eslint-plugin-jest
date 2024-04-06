import dedent from 'dedent';
import rule from '../max-expects';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('max-expects', rule, {
  valid: [
    `test('should pass')`,
    `test('should pass', () => {})`,
    `test.skip('should pass', () => {})`,
    dedent`
      test('should pass', function () {
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        // expect(true).toBeDefined();
      });
    `,
    dedent`
      it('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', async () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', async () => {
        expect.hasAssertions();

        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', async () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toEqual(expect.any(Boolean));
      });
    `,
    dedent`
      test('should pass', async () => {
        expect.hasAssertions();

        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toEqual(expect.any(Boolean));
      });
    `,
    dedent`
      describe('test', () => {
        test('should pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      });
    `,
    dedent`
      test.each(['should', 'pass'], () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should not pass', () => {
        const checkValue = (value) => {
          expect(value).toBeDefined();
          expect(value).toBeDefined();
        };

        checkValue(true);
      });
      test('should not pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should not pass', done => {
        emitter.on('event', value => {
          expect(value).toBeDefined();
          expect(value).toBeDefined();
          expect(value).toBeDefined();
          expect(value).toBeDefined();

          done();
        });
      });
      test('should not pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      function myHelper() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };

      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      function myHelper1() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };

      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });

      function myHelper2() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });

      function myHelper() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };
    `,
    dedent`
      const myHelper1 = () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };

      test('should pass', function() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });

      const myHelper2 = function() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };
    `,
    {
      code: dedent`
        test('should pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [
        {
          max: 10,
        },
      ],
    },
    {
      code: dedent`
        describe('given decimal places', () => {
          it("test 1", fakeAsync(() => {
            expect(true).toBeTrue();
            expect(true).toBeTrue();
            expect(true).toBeTrue();
          }))

          it("test 2", fakeAsync(() => {
            expect(true).toBeTrue();
            expect(true).toBeTrue();
            expect(true).toBeTrue();
          }))
        })
      `,
      options: [{ max: 5 }],
    },
  ],
  invalid: [
    {
      code: dedent`
        test('should not pass', function () {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        it('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        it('should not pass', async () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 7,
          column: 3,
        },
        {
          messageId: 'exceededMaxAssertion',
          line: 15,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          const checkValue = (value) => {
            expect(value).toBeDefined();
            expect(value).toBeDefined();
          };

          checkValue(true);
        });
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 4,
          column: 5,
        },
        {
          messageId: 'exceededMaxAssertion',
          line: 11,
          column: 3,
        },
        {
          messageId: 'exceededMaxAssertion',
          line: 12,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          const checkValue = (value) => {
            expect(value).toBeDefined();
            expect(value).toBeDefined();
          };

          checkValue(true);
        });
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 12,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          const checkValue = (value) => {
            expect(value).toBeDefined();
            expect(value).toBeDefined();
          };

          expect(value).toBeDefined();
          checkValue(true);
        });
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 13,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', done => {
          emitter.on('event', value => {
            expect(value).toBeDefined();
            expect(value).toBeDefined();

            done();
          });
        });
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 4,
          column: 5,
        },
        {
          messageId: 'exceededMaxAssertion',
          line: 11,
          column: 3,
        },
        {
          messageId: 'exceededMaxAssertion',
          line: 12,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', done => {
          emitter.on('event', value => {
            expect(value).toBeDefined();
            expect(value).toBeDefined();

            done();
          });
        });
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 12,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('given decimal places', () => {
          it("test 1", fakeAsync(() => {
            expect(true).toBeTrue();
            expect(true).toBeTrue();
            expect(true).toBeTrue();
          }))

          it("test 2", fakeAsync(() => {
            expect(true).toBeTrue();
            expect(true).toBeTrue();
            expect(true).toBeTrue();
            expect(true).toBeTrue();
            expect(true).toBeTrue();
          }))
        })
      `,
      options: [{ max: 3 }],
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 12,
          column: 5,
        },
        {
          messageId: 'exceededMaxAssertion',
          line: 13,
          column: 5,
        },
      ],
    },
    {
      code: dedent`
        describe('test', () => {
          test('should not pass', () => {
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
          });
        });
      `,
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 8,
          column: 5,
        },
      ],
    },
    {
      code: dedent`
        test.each(['should', 'not', 'pass'], () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 7,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [
        {
          max: 1,
        },
      ],
      errors: [
        {
          messageId: 'exceededMaxAssertion',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});
