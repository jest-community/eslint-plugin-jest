import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../no-if';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('conditional expressions', rule, {
  valid: [
    'const x = y ? 1 : 0',
    dedent`
      it('foo', () => {
        const foo = function (bar) {
          return foo ? bar : null;
        };
      });
    `,
    dedent`
      it('foo', function () {
        const foo = function (bar) {
          return foo ? bar : null;
        };
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
          data: { condition: 'conditional' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'conditional' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'conditional' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'conditional' },
          messageId: 'conditionalInTest',
        },
        {
          data: { condition: 'conditional' },
          messageId: 'conditionalInTest',
        },
      ],
    },
  ],
});

ruleTester.run('switch statements', rule, {
  valid: [
    dedent`
      switch (true) {
        case true: {}
      }
    `,
    `it('foo', () => {})`,
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
      it('valid', () => {
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
    dedent`
      describe('valid', () => {
        it('still valid', () => {
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
      });
    `,
  ],
  invalid: [
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: "it('foo', myTest); function myTest() { switch ('bar') {} }",
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        describe('valid', () => {
          describe('still valid', () => {
            it('really still valid', () => {
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
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
  ],
});

ruleTester.run('if statements', rule, {
  valid: [
    'if(foo) {}',
    "it('foo', () => {})",
    'it("foo", function () {})',
    "it('foo', () => {}); function myTest() { if('bar') {} }",
    dedent`
      foo('bar', () => {
        if(baz) {}
      })
    `,
    dedent`
      describe('foo', () => {
        if('bar') {}
      })
    `,
    dedent`
      describe.skip('foo', () => {
        if('bar') {}
      })
    `,
    dedent`
      xdescribe('foo', () => {
        if('bar') {}
      })
    `,
    dedent`
      fdescribe('foo', () => {
        if('bar') {}
      })
    `,
    dedent`
      describe('foo', () => {
        if('bar') {}
      })
      if('baz') {}
    `,
    dedent`
      describe('foo', () => {
        afterEach(() => {
          if('bar') {}
        });
      })
    `,
    dedent`
      describe('foo', () => {
        beforeEach(() => {
          if('bar') {}
        });
      })
    `,
    'const foo = bar ? foo : baz;',
    dedent`
      it('valid', () => {
        const values = something.map((thing) => {
          if (thing.isFoo) {
            return thing.foo
          } else {
            return thing.bar;
          }
        });

        expect(values).toStrictEqual(['foo']);
      });
    `,
    dedent`
      describe('valid', () => {
        it('still valid', () => {
          const values = something.map((thing) => {
            if (thing.isFoo) {
              return thing.foo
            } else {
              return thing.bar;
            }
          });

          expect(values).toStrictEqual(['foo']);
        });
      });
    `,
    dedent`
      describe('valid', () => {
        describe('still valid', () => {
          it('really still valid', () => {
            const values = something.map((thing) => {
              if (thing.isFoo) {
                return thing.foo
              } else {
                return thing.bar;
              }
            });

            expect(values).toStrictEqual(['foo']);
          });
        });
      });
    `,
    dedent`
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
    dedent`
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
  ],
  invalid: [
    {
      code: dedent`
        it('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        it.skip('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        it.skip('foo', function () {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        it.concurrent.skip('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        it.only('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        it.concurrent.only('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        xit('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        fit('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        fit.concurrent('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        test('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        test.concurrent.skip('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        test.concurrent.only('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        xtest('foo', () => {
          if('bar') {}
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          it('bar', () => {
            if('bar') {}
          })
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: "it('foo', myTest); function myTest() { if ('bar') {} }",
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          it('bar', () => {
            if('bar') {}
          })
          it('baz', () => {
            if('qux') {}
            if('quux') {}
          })
        })
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
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
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: dedent`
        describe('valid', () => {
          describe('still valid', () => {
            it('really still valid', () => {
              const values = something.map((thing) => {
                if (thing.isFoo) {
                  return thing.foo
                } else {
                  return thing.bar;
                }
              });
  
              if('invalid') {
                expect(values).toStrictEqual(['foo']);
              }
            });
          });
        });
      `,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
  ],
});
