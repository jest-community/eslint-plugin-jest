import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import rule from '../prefer-expect-assertions';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('prefer-expect-assertions', rule, {
  valid: [
    'test("nonsense", [])',
    'test("it1", () => {expect.assertions(0);})',
    'test("it1", function() {expect.assertions(0);})',
    'test("it1", function() {expect.hasAssertions();})',
    'it("it1", function() {expect.assertions(0);})',
    dedent`
      it("it1", function() {
        expect.assertions(1);
        expect(someValue).toBe(true)
      })
    `,
    'test("it1")',
    'itHappensToStartWithIt("foo", function() {})',
    'testSomething("bar", function() {})',
    'it(async () => {expect.assertions(0);})',
    dedent`
      it("returns numbers that are greater than four", function() {
        expect.assertions(2);

        for(let thing in things) {
          expect(number).toBeGreaterThan(4);
        }
      })
    `,
    dedent`
      it("returns numbers that are greater than four", function() {
        expect.hasAssertions();

        for (let i = 0; i < things.length; i++) {
          expect(number).toBeGreaterThan(4);
        }
      })
    `,
    {
      code: dedent`
        it("it1", async () => {
          expect.assertions(1);
          expect(someValue).toBe(true)
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: dedent`
        it("it1", function() {
          expect(someValue).toBe(true)
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'it("it1", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          expect.assertions(2);

          for(let thing in things) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", () => {
          for(let thing in things) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
  ],
  invalid: [
    {
      code: 'it("it1", () => {})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: 'it("it1", () => {expect.hasAssertions();})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", () => {expect.assertions();})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", () => { foo()})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: 'it("it1", () => { expect.hasAssertions();foo()})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", () => { expect.assertions();foo()})',
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", function() {
          someFunctionToDo();
          someFunctionToDo2();
        })
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", function() {
                  expect.hasAssertions();someFunctionToDo();
                  someFunctionToDo2();
                })
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", function() {
                  expect.assertions();someFunctionToDo();
                  someFunctionToDo2();
                })
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {var a = 2;})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output:
                'it("it1", function() {expect.hasAssertions();var a = 2;})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", function() {expect.assertions();var a = 2;})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions();})',
      errors: [
        {
          messageId: 'assertionsRequiresOneArgument',
          column: 30,
          line: 1,
          suggestions: [],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions(1,2);})',
      errors: [
        {
          messageId: 'assertionsRequiresOneArgument',
          column: 43,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.assertions(1);})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions("1");})',
      errors: [
        {
          messageId: 'assertionsRequiresNumberArgument',
          column: 41,
          line: 1,
          suggestions: [],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.hasAssertions("1");})',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 30,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.hasAssertions();})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.hasAssertions("1", "2");})',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 30,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.hasAssertions();})',
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", function() {
          expect.hasAssertions(() => {
            someFunctionToDo();
            someFunctionToDo2();
          });
        })
      `,
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 10,
          line: 2,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: dedent`
                it("it1", function() {
                  expect.hasAssertions();
                })
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", async function() {
          expect(someValue).toBe(true);
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          for(let thing in things) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })

        it("returns numbers that are greater than five", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(5);
          }
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-expect-assertions (loops)', rule, {
  valid: [
    {
      code: dedent`
        const expectNumbersToBeGreaterThan = (numbers, value) => {
          for (let number of getNumbers()()) {
            expect(number).toBeGreaterThan(value);
          }
        };

        it('returns numbers that are greater than two', function () {
          expectNumbersToBeGreaterThan(getNumbers(), 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
    },
    {
      code: dedent`
        it('returns numbers that are greater than two', function () {
          const expectNumbersToBeGreaterThan = (numbers, value) => {
            for (let number of getNumbers()()) {
              expect(number).toBeGreaterThan(value);
            }
          };

          expectNumbersToBeGreaterThan(getNumbers(), 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
    },
    {
      code: dedent`
        it("returns numbers that are greater than five", function () {
          expect.assertions(2);

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(5);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
    },
    {
      code: dedent`
        it("returns things that are less than ten", function () {
          expect.hasAssertions();

          for (const thing in things) {
            expect(thing).toBeLessThan(10);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
    },
  ],
  invalid: [
    {
      code: dedent`
        it('only returns numbers that are greater than six', () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(6);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it("only returns numbers that are greater than seven", function () {
          const numbers = getNumbers();

          for (let i = 0; i < numbers.length; i++) {
            expect(numbers[i]).toBeGreaterThan(7);
          }
        })
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it('has the number two', () => {
          expect(number).toBe(2);
        })

        it('only returns numbers that are less than twenty', () => {
          for (const number of getNumbers()) {
            expect(number).toBeLessThan(20);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 5,
        },
      ],
    },
    {
      code: dedent`
        it("is wrong");

        it("is a test", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        })

        it("returns numbers that are greater than four", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })

        it("returns numbers that are greater than five", () => {
          expect(number).toBeGreaterThan(5);
        })
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 5,
        },
      ],
    },
    {
      code: dedent`
        it.each([1, 2, 3])("returns numbers that are greater than four", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("is a number that is greater than four", () => {
          expect.hasAssertions();

          expect(number).toBeGreaterThan(4);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it("it1", () => {
          expect.hasAssertions();

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
        });

        it("it1", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          for (const number of await getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("returns numbers that are greater than five", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(5);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        it("it1", async () => {
          expect.hasAssertions();

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })

        it("it1", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        it.skip.each\`\`("it1", async () => {
          expect.hasAssertions();

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })

        it("it1", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        it("it1", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })

        it("it1", () => {
          expect.hasAssertions();

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        })
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-expect-assertions (mixed)', rule, {
  valid: [
    {
      code: dedent`
        it('only returns numbers that are greater than zero', async () => {
          expect.hasAssertions();

          for (const number of await getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
        })
      `,
      options: [
        {
          onlyFunctionsWithAsyncKeyword: true,
          onlyFunctionsWithExpectInLoop: true,
        },
      ],
    },
    {
      code: dedent`
        it('only returns numbers that are greater than zero', async () => {
          expect.assertions(2);

          for (const number of await getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
        })
      `,
      options: [
        {
          onlyFunctionsWithAsyncKeyword: true,
          onlyFunctionsWithExpectInLoop: true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: dedent`
        it('only returns numbers that are greater than zero', () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
        });

        it("is zero", () => {
          expect.hasAssertions();

          expect(0).toBe(0);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it('only returns numbers that are greater than zero', () => {
          expect.hasAssertions();

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
        });

        it('only returns numbers that are less than 100', () => {
          for (const number of getNumbers()) {
            expect(number).toBeLessThan(0);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        it("to be true", async function() {
          expect(someValue).toBe(true);
        });
      `,
      options: [
        {
          onlyFunctionsWithAsyncKeyword: true,
          onlyFunctionsWithExpectInLoop: true,
        },
      ],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it('only returns numbers that are greater than zero', async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
        })
      `,
      options: [
        {
          onlyFunctionsWithAsyncKeyword: true,
          onlyFunctionsWithExpectInLoop: true,
        },
      ],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('.each support', rule, {
  valid: [
    'test.each()("is fine", () => { expect.assertions(0); })',
    'test.each``("is fine", () => { expect.assertions(0); })',
    'test.each()("is fine", () => { expect.hasAssertions(); })',
    'test.each``("is fine", () => { expect.hasAssertions(); })',
    'it.each()("is fine", () => { expect.assertions(0); })',
    'it.each``("is fine", () => { expect.assertions(0); })',
    'it.each()("is fine", () => { expect.hasAssertions(); })',
    'it.each``("is fine", () => { expect.hasAssertions(); })',
    {
      code: 'test.each()("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'test.each``("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'it.each()("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'it.each``("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    dedent`
      describe.each(['hello'])('%s', () => {
        it('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each(['hello'])('%s', () => {
        it('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
    dedent`
      describe.each(['hello'])('%s', () => {
        it.each()('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it.each()('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each(['hello'])('%s', () => {
        it.each()('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it.each()('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        test.each()("is not fine", () => {
          expect(someValue).toBe(true);
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        describe.each()('something', () => {
          it("is not fine", () => {
            expect(someValue).toBe(true);
          });
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        describe.each()('something', () => {
          test.each()("is not fine", () => {
            expect(someValue).toBe(true);
          });
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test.each()("is not fine", async () => {
          expect(someValue).toBe(true);
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it.each()("is not fine", async () => {
          expect(someValue).toBe(true);
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        describe.each()('something', () => {
          test.each()("is not fine", async () => {
            expect(someValue).toBe(true);
          });
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
        },
      ],
    },
  ],
});
