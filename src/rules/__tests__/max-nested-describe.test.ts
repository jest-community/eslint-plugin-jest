import dedent from 'dedent';
import rule from '../max-nested-describe';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('max-nested-describe', rule, {
  valid: [
    dedent`
      describe('foo', function() {
        describe('bar', function () {
          describe('baz', function () {
            describe('qux', function () {
              describe('qux', function () {
                it('should get something', () => {
                  expect(getSomething()).toBe('Something');
                });
              })
            })
          })
        })
      });
    `,
    dedent`
      describe('foo', function() {
        describe('bar', function () {
          describe('baz', function () {
            describe('qux', function () {
              describe('qux', function () {
                it('should get something', () => {
                  expect(getSomething()).toBe('Something');
                });
              });

              fdescribe('qux', () => {
                it('something', async () => {
                  expect('something').toBe('something');
                });
              });
            })
          })
        })
      });
    `,
    dedent`
      describe('foo', () => {
        describe('bar', () => {
          it('hello', async () => {
            expect('hello').toBe('hello');
          });
        });
      });

      xdescribe('foo', function() {
        describe('bar', function() {
          it('something', async () => {
            expect('something').toBe('something');
          });
        });
      });
    `,
    {
      code: dedent`
        describe('foo', () => {
          describe.only('bar', () => {
            describe.skip('baz', () => {
              it('something', async () => {
                expect('something').toBe('something');
              });
            });
          });
        });
    `,
      options: [{ max: 3 }],
    },
    {
      code: dedent`
        it('something', async () => {
          expect('something').toBe('something');
        });
    `,
      options: [{ max: 0 }],
    },
    dedent`
      describe('foo', () => {
        describe.each(['hello', 'world'])("%s", (a) => {});
      });
    `,
    dedent`
      describe('foo', () => {
        describe.each\`
        foo  | bar
        ${'1'} | ${'2'}
        \`('$foo $bar', ({ foo, bar }) => {});
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        describe('foo', function() {
          describe('bar', function () {
            describe('baz', function () {
              describe('qux', function () {
                describe('quxx', function () {
                  describe('over limit', function () {
                    it('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });
                });
              });
            });
          });
        });
      `,
      errors: [{ messageId: 'exceededMaxDepth', line: 6, column: 11 }],
    },
    {
      code: dedent`
        describe('foo', () => {
          describe('bar', () => {
            describe('baz', () => {
              describe('baz1', () => {
                describe('baz2', () => {
                  describe('baz3', () => {
                    it('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });

                  describe('baz4', () => {
                    it('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });
                });
              });
            });

            describe('qux', function () {
              it('should get something', () => {
                expect(getSomething()).toBe('Something');
              });
            });
          })
        });
      `,
      errors: [
        { messageId: 'exceededMaxDepth', line: 6, column: 11 },
        { messageId: 'exceededMaxDepth', line: 12, column: 11 },
      ],
    },
    {
      code: dedent`
        fdescribe('foo', () => {
          describe.only('bar', () => {
            describe.skip('baz', () => {
              it('should get something', () => {
                expect(getSomething()).toBe('Something');
              });
            });

            describe('baz', () => {
              it('should get something', () => {
                expect(getSomething()).toBe('Something');
              });
            });
          });
        });

        xdescribe('qux', () => {
          it('should get something', () => {
            expect(getSomething()).toBe('Something');
          });
        });
      `,
      options: [{ max: 2 }],
      errors: [
        { messageId: 'exceededMaxDepth', line: 3, column: 5 },
        { messageId: 'exceededMaxDepth', line: 9, column: 5 },
      ],
    },
    {
      code: dedent`
        describe('qux', () => {
          it('should get something', () => {
            expect(getSomething()).toBe('Something');
          });
        });
      `,
      options: [{ max: 0 }],
      errors: [{ messageId: 'exceededMaxDepth', line: 1, column: 1 }],
    },
    {
      code: dedent`
        describe('foo', () => {
          describe.each(['hello', 'world'])("%s", (a) => {});
        });
      `,
      options: [{ max: 1 }],
      errors: [{ messageId: 'exceededMaxDepth', line: 2, column: 3 }],
    },
    {
      code: dedent`
        describe('foo', () => {
          describe.each\`
          foo  | bar
          ${'1'} | ${'2'}
          \`('$foo $bar', ({ foo, bar }) => {});
        });
      `,
      options: [{ max: 1 }],
      errors: [{ messageId: 'exceededMaxDepth', line: 2, column: 3 }],
    },
  ],
});
