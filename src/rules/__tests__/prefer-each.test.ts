import dedent from 'dedent';
import rule from '../prefer-each';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-each', rule, {
  valid: [
    'it("is true", () => { expect(true).toBe(false) });',
    dedent`
      it.each(getNumbers())("only returns numbers that are greater than seven", number => {
        expect(number).toBeGreaterThan(7);
      });
    `,
    // while these cases could be done with .each, it's reasonable to have more
    // complex cases that would not look good in .each, so we consider this valid
    dedent`
      it("returns numbers that are greater than five", function () {
        for (const number of getNumbers()) {
          expect(number).toBeGreaterThan(5);
        }
      });
    `,
    dedent`
      it("returns things that are less than ten", function () {
        for (const thing in things) {
          expect(thing).toBeLessThan(10);
        }
      });
    `,
    dedent`
      it("only returns numbers that are greater than seven", function () {
        const numbers = getNumbers();

        for (let i = 0; i < numbers.length; i++) {
          expect(numbers[i]).toBeGreaterThan(7);
        }
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        for (const [input, expected] of data) {
          it(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          describe(\`when the input is $\{input}\`, () => {
            it(\`results in $\{expected}\`, () => {
              expect(fn(input)).toBe(expected)
            });
          });
        }
      `,
      errors: [
        {
          data: { fn: 'describe' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          describe(\`when the input is $\{input}\`, () => {
            it(\`results in $\{expected}\`, () => {
              expect(fn(input)).toBe(expected)
            });
          });
        }

        for (const [input, expected] of data) {
          it.skip(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'describe' },
          messageId: 'preferEach',
        },
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          it.skip(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(true).toBe(false);
        });

        for (const [input, expected] of data) {
          it.skip(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          it.skip(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }

        it('is true', () => {
          expect(true).toBe(false);
        });
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(true).toBe(false);
        });

        for (const [input, expected] of data) {
          it.skip(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }

        it('is true', () => {
          expect(true).toBe(false);
        });
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          it(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });

          it(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'describe' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          it(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }

        for (const [input, expected] of data) {
          it(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          it(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }

        for (const [input, expected] of data) {
          test(\`results in $\{expected}\`, () => {
            expect(fn(input)).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          beforeEach(() => setupSomething(input));

          test(\`results in $\{expected}\`, () => {
            expect(doSomething()).toBe(expected)
          });
        }
      `,
      errors: [
        {
          data: { fn: 'describe' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          it("only returns numbers that are greater than seven", function () {
            const numbers = getNumbers(input);

            for (let i = 0; i < numbers.length; i++) {
              expect(numbers[i]).toBeGreaterThan(7);
            }
          });
        }
      `,
      errors: [
        {
          data: { fn: 'it' },
          messageId: 'preferEach',
        },
      ],
    },
    {
      code: dedent`
        for (const [input, expected] of data) {
          beforeEach(() => setupSomething(input));

          it("only returns numbers that are greater than seven", function () {
            const numbers = getNumbers();

            for (let i = 0; i < numbers.length; i++) {
              expect(numbers[i]).toBeGreaterThan(7);
            }
          });
        }
      `,
      errors: [
        {
          data: { fn: 'describe' },
          messageId: 'preferEach',
        },
      ],
    },
  ],
});
