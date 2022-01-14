import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../no-conditional-in-test';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('conditional expressions', rule, {
  valid: [
    'const x = y ? 1 : 0',
    dedent`
      const foo = function (bar) {
        return foo ? bar : null;
      };

      it('foo', () => {
        foo();
      });
    `,
    dedent`
      const foo = function (bar) {
        return foo ? bar : null;
      };

      it.each()('foo', function () {
        foo();
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        it('foo', () => {
          expect(bar ? foo : baz).toBe(boo);
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 10,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('foo', function () {
          const foo = function (bar) {
            return foo ? bar : null;
          };
        });
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 12,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          const foo = bar ? foo : baz;
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 15,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          const foo = bar ? foo : baz;
        })
        const foo = bar ? foo : baz;
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 15,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          const foo = bar ? foo : baz;
          const anotherFoo = anotherBar ? anotherFoo : anotherBaz;
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 15,
          line: 2,
        },
        {
          messageId: 'conditionalInTest',
          column: 22,
          line: 3,
        },
      ],
    },
  ],
});

ruleTester.run('switch statements', rule, {
  valid: [
    `it('foo', () => {})`,
    dedent`
      switch (true) {
        case true: {}
      }
    `,
    dedent`
      it('foo', () => {});
      function myTest() {
        switch ('bar') {
        }
      }
    `,
    dedent`
      foo('bar', () => {
        switch(baz) {}
      })
    `,
    dedent`
      describe('foo', () => {
        switch('bar') {}
      })
    `,
    dedent`
      describe.skip('foo', () => {
        switch('bar') {}
      })
    `,
    dedent`
      describe.skip.each()('foo', () => {
        switch('bar') {}
      })
    `,
    dedent`
      xdescribe('foo', () => {
        switch('bar') {}
      })
    `,
    dedent`
      fdescribe('foo', () => {
        switch('bar') {}
      })
    `,
    dedent`
      describe('foo', () => {
        switch('bar') {}
      })
      switch('bar') {}
    `,
    dedent`
      describe('foo', () => {
        afterEach(() => {
          switch('bar') {}
        });
      });
    `,
    dedent`
      const values = something.map(thing => {
        switch (thing.isFoo) {
          case true:
            return thing.foo;
          default:
            return thing.bar;
        }
      });

      it('valid', () => {
        expect(values).toStrictEqual(['foo']);
      });
    `,
    dedent`
      describe('valid', () => {
        const values = something.map(thing => {
          switch (thing.isFoo) {
            case true:
              return thing.foo;
            default:
              return thing.bar;
          }
        });
        it('still valid', () => {
          expect(values).toStrictEqual(['foo']);
        });
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        it('is invalid', () => {
          const values = something.map(thing => {
            switch (thing.isFoo) {
              case true:
                return thing.foo;
              default:
                return thing.bar;
            }
          });

          expect(values).toStrictEqual(['foo']);
        });
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          switch (true) {
            case true: {}
          }
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.skip('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.concurrent.skip('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.only('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.concurrent.only('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        xit('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        fit('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        fit.concurrent('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test.concurrent.skip('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test.concurrent.only('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        xtest('foo', () => {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        xtest('foo', function () {
          switch('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          it('bar', () => {

            switch('bar') {}
          })
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          it('bar', () => {
            switch('bar') {}
          })
          it('baz', () => {
            switch('qux') {}
            switch('quux') {}
          })
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 3,
        },
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 6,
        },
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          callExpression()
          switch ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('valid', () => {
          describe('still valid', () => {
            it('is not valid', () => {
              const values = something.map((thing) => {
                switch (thing.isFoo) {
                  case true:
                    return thing.foo;
                  default:
                    return thing.bar;
                }
              });
  
              switch('invalid') {
                case true:
                  expect(values).toStrictEqual(['foo']);
              }
            });
          });
        });
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 9,
          line: 5,
        },
        {
          messageId: 'conditionalInTest',
          column: 7,
          line: 13,
        },
      ],
    },
  ],
});

ruleTester.run('if statements', rule, {
  valid: [
    'if (foo) {}',
    "it('foo', () => {})",
    'it("foo", function () {})',
    "it('foo', () => {}); function myTest() { if ('bar') {} }",
    dedent`
      foo('bar', () => {
        if (baz) {}
      })
    `,
    dedent`
      describe('foo', () => {
        if ('bar') {}
      })
    `,
    dedent`
      describe.skip('foo', () => {
        if ('bar') {}
      })
    `,
    dedent`
      xdescribe('foo', () => {
        if ('bar') {}
      })
    `,
    dedent`
      fdescribe('foo', () => {
        if ('bar') {}
      })
    `,
    dedent`
      describe('foo', () => {
        if ('bar') {}
      })
      if ('baz') {}
    `,
    dedent`
      describe('foo', () => {
        afterEach(() => {
          if ('bar') {}
        });
      })
    `,
    dedent`
      describe.each\`\`('foo', () => {
        afterEach(() => {
          if ('bar') {}
        });
      })
    `,
    dedent`
      describe('foo', () => {
        beforeEach(() => {
          if ('bar') {}
        });
      })
    `,
    'const foo = bar ? foo : baz;',
    dedent`
      const values = something.map((thing) => {
        if (thing.isFoo) {
          return thing.foo
        } else {
          return thing.bar;
        }
      });

      describe('valid', () => {
        it('still valid', () => {
          expect(values).toStrictEqual(['foo']);
        });
      });
    `,
    dedent`
      describe('valid', () => {
        const values = something.map((thing) => {
          if (thing.isFoo) {
            return thing.foo
          } else {
            return thing.bar;
          }
        });

        describe('still valid', () => {
          it('really still valid', () => {
            expect(values).toStrictEqual(['foo']);
          });
        });
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        it('foo', () => {
          const foo = function(bar) {
            if (bar) {
              return 1;
            } else {
              return 2;
            }
          };
        });
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          function foo(bar) {
            if (bar) {
              return 1;
            } else {
              return 2;
            }
          };
        });
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.skip('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.skip('foo', function () {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.concurrent.skip('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.only('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it.concurrent.only('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        xit('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        fit('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        fit.concurrent('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test.concurrent.skip('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test.concurrent.only('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        xtest('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          it('bar', () => {
            if ('bar') {}
          })
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          it('bar', () => {
            if ('bar') {}
          })
          it('baz', () => {
            if ('qux') {}
            if ('quux') {}
          })
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 3,
        },
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 6,
        },
        {
          messageId: 'conditionalInTest',
          column: 5,
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        it('foo', () => {
          callExpression()
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it.each\`\`('foo', () => {
          callExpression()
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it.each()('foo', () => {
          callExpression()
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it.only.each\`\`('foo', () => {
          callExpression()
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it.only.each()('foo', () => {
          callExpression()
          if ('bar') {}
        })
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('valid', () => {
          describe('still valid', () => {
            it('is invalid', () => {
              const values = something.map((thing) => {
                if (thing.isFoo) {
                  return thing.foo
                } else {
                  return thing.bar;
                }
              });

              if ('invalid') {
                expect(values).toStrictEqual(['foo']);
              }
            });
          });
        });
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 9,
          line: 5,
        },
        {
          messageId: 'conditionalInTest',
          column: 7,
          line: 12,
        },
      ],
    },
    {
      code: dedent`
        test("shows error", () => {
          if (1 === 2) {
            expect(true).toBe(false);
          }
        });

        test("does not show error", () => {
          setTimeout(() => console.log("noop"));
          if (1 === 2) {
            expect(true).toBe(false);
          }
        });
      `,
      errors: [
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 2,
        },
        {
          messageId: 'conditionalInTest',
          column: 3,
          line: 9,
        },
      ],
    },
  ],
});
