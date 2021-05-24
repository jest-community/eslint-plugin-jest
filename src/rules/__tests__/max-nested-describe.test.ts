import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../max-nested-describe';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('max-nested-describe', rule, {
  valid: [
    dedent`
      describe('foo', () => {
        describe('bar', () => {
          it('hello', async () => {
            expect('hello').toBe('hello');
          });
        });
      });
    `,
    dedent`
      describe('foo', () => {
        describe('bar', () => {
          it('hello', async () => {
            expect('hello').toBe('hello');
          });
        });

        describe('qux', () => {
          it('something', async () => {
            expect('something').toBe('something');
          });
        });
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

      describe('foo', function() {
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
        describe('bar', () => {
          describe('baz', () => {
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
  ],
  invalid: [
    {
      code: dedent`
        describe('foo', function() {
          describe('bar', function () {
            describe('baz', function () {
              describe('qux', function () {
                it('should get something', () => {
                  expect(getSomething().toBe('Something'))
                });
              })
            })
          })
        });
      `,
      errors: [
        { messageId: 'exceededMaxDepth', line: 3, column: 5 },
        { messageId: 'exceededMaxDepth', line: 4, column: 7 },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          describe('bar', () => {
            describe('baz', () => {
              it('should get something', () => {
                expect(getSomething().toBe('Something'))
              });
            });

            describe('qux', function () {
              it('should get something', () => {
                expect(getSomething().toBe('Something'))
              });
            });
          })
        });
      `,
      errors: [
        { messageId: 'exceededMaxDepth', line: 3, column: 5 },
        { messageId: 'exceededMaxDepth', line: 9, column: 5 },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          describe('bar', () => {
            describe('baz', () => {
              it('should get something', () => {
                expect(getSomething().toBe('Something'))
              });
            });
          });
        });

        describe('qux', () => {
          it('should get something', () => {
            expect(getSomething().toBe('Something'))
          });
        });
      `,
      errors: [{ messageId: 'exceededMaxDepth', line: 3, column: 5 }],
    },
    {
      code: dedent`
        describe('qux', () => {
          it('should get something', () => {
            expect(getSomething().toBe('Something'))
          });
        });
      `,
      options: [{ max: 0 }],
      errors: [{ messageId: 'exceededMaxDepth', line: 1, column: 1 }],
    },
  ],
});
