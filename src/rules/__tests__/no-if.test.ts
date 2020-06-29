import { TSESLint } from '@typescript-eslint/experimental-utils';
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
    {
      code: 'const x = y ? 1 : 0',
    },
    {
      code: `it('foo', () => {
        const foo = function(bar) {
          return foo ? bar : null;
        };
      });`,
    },
  ],
  invalid: [
    {
      code: `it('foo', () => {
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
      code: `it('foo', () => {
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
      code: `it('foo', () => {
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
    {
      code: `
      switch (true) {
        case true: {}
      }
      `,
    },
    {
      code: `it('foo', () => {})`,
    },
    {
      code: `
      it('foo', () => {});
      function myTest() {
        switch ('bar') {
        }
      }
      `,
    },
    {
      code: `
      foo('bar', () => {
        switch(baz) {}
      })
      `,
    },
    {
      code: `
      describe('foo', () => {
        switch('bar') {}
      })
      `,
    },
    {
      code: `
      describe.skip('foo', () => {
        switch('bar') {}
      })
      `,
    },
    {
      code: `
      xdescribe('foo', () => {
        switch('bar') {}
      })
      `,
    },
    {
      code: `
      fdescribe('foo', () => {
        switch('bar') {}
      })
      `,
    },
    {
      code: `describe('foo', () => {
        switch('bar') {}
      })
      switch('bar') {}
      `,
    },
    {
      code: `
      describe('foo', () => {
        afterEach(() => {
          switch('bar') {}
        });
      });
      `,
    },
    {
      code: `
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
    },
    {
      code: `
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
    },
  ],
  invalid: [
    {
      code: `
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
      code: `it('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.skip('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.concurrent.skip('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.only('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.concurrent.only('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `xit('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `fit('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `fit.concurrent('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `test('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `test.concurrent.skip('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `test.concurrent.only('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `xtest('foo', () => {
        switch('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `describe('foo', () => {
        it('bar', () => {
          switch('bar') {}
        })
      })`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it('foo', myTest); function myTest() { switch ('bar') {} }`,
      errors: [
        {
          data: { condition: 'switch' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `describe('foo', () => {
        it('bar', () => {
          switch('bar') {}
        })
        it('baz', () => {
          switch('qux') {}
          switch('quux') {}
        })
      })`,
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
      code: `it('foo', () => {
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
      code: `
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
    {
      code: `if(foo) {}`,
    },
    {
      code: `it('foo', () => {})`,
    },
    {
      code: `it('foo', () => {}); function myTest() { if('bar') {} }`,
    },
    {
      code: `foo('bar', () => {
        if(baz) {}
      })`,
    },
    {
      code: `describe('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `describe.skip('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `xdescribe('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `fdescribe('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `describe('foo', () => {
        if('bar') {}
      })
      if('baz') {}
      `,
    },
    {
      code: `describe('foo', () => {
          afterEach(() => {
            if('bar') {}
          });
        })
      `,
    },
    {
      code: `describe('foo', () => {
          beforeEach(() => {
            if('bar') {}
          });
        })
      `,
    },
    {
      code: `const foo = bar ? foo : baz;`,
    },
    {
      code: `
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
    },
    {
      code: `
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
    },
    {
      code: `
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
    },
    {
      code: `it('foo', () => {
        const foo = function(bar) {
          if (bar) {
            return 1;
          } else {
            return 2;
          }
        };
      });`,
    },
    {
      code: `it('foo', () => {
        function foo(bar) {
          if (bar) {
            return 1;
          } else {
            return 2;
          }
        };
      });`,
    },
  ],
  invalid: [
    {
      code: `it('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.skip('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.concurrent.skip('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.only('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it.concurrent.only('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `xit('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `fit('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `fit.concurrent('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `test('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `test.concurrent.skip('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `test.concurrent.only('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `xtest('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `describe('foo', () => {
        it('bar', () => {
          if('bar') {}
        })
      })`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `it('foo', myTest); function myTest() { if ('bar') {} }`,
      errors: [
        {
          data: { condition: 'if' },
          messageId: 'conditionalInTest',
        },
      ],
    },
    {
      code: `describe('foo', () => {
        it('bar', () => {
          if('bar') {}
        })
        it('baz', () => {
          if('qux') {}
          if('quux') {}
        })
      })`,
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
      code: `it('foo', () => {
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
      code: `
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
