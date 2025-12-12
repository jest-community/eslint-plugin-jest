import dedent from 'dedent';
import rule from '../prefer-expect-assertions';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
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
      });
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
      });
    `,
    dedent`
      it("returns numbers that are greater than four", function() {
        expect.hasAssertions();

        for (let i = 0; i < things.length; i++) {
          expect(number).toBeGreaterThan(4);
        }
      });
    `,
    {
      code: dedent`
        it("it1", async () => {
          expect.assertions(1);
          expect(someValue).toBe(true)
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: dedent`
        it("it1", function() {
          expect(someValue).toBe(true)
        });
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
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", () => {
          for(let thing in things) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: dedent`
        import { expect as pleaseExpect } from '@jest/globals';

        it("returns numbers that are greater than four", function() {
          pleaseExpect.assertions(2);

          for(let thing in things) {
            pleaseExpect(number).toBeGreaterThan(4);
          }
        });
      `,
      parserOptions: { sourceType: 'module' },
    },
    dedent`
      beforeEach(() => expect.hasAssertions());

      it('responds ok', function () {
        client.get('/user', response => {
          expect(response.status).toBe(200);
        });
      });

      it("is a number that is greater than four", () => {
        expect(number).toBeGreaterThan(4);
      });
    `,
    dedent`
      afterEach(() => {
        expect.hasAssertions();
      });

      it('responds ok', function () {
        client.get('/user', response => {
          expect(response.status).toBe(200);
        });
      });

      it("is a number that is greater than four", () => {
        expect(number).toBeGreaterThan(4);
      });
    `,
    dedent`
      afterEach(() => {
        expect.hasAssertions();
      });

      it('responds ok', function () {
        client.get('/user', response => {
          expect(response.status).toBe(200);
        });
      });

      it("is a number that is greater than four", () => {
        expect.hasAssertions();

        expect(number).toBeGreaterThan(4);
      });
    `,
    dedent`
      beforeEach(() => { expect.hasAssertions(); });

      describe('my tests', () => {
        it('responds ok', function () {
          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        it("is a number that is greater than four", () => {
          expect.hasAssertions();

          expect(number).toBeGreaterThan(4);
        });
      });
    `,
    dedent`
      describe('my tests', () => {
        beforeEach(() => { expect.hasAssertions(); });

        describe('left', () => {
          describe('inner', () => {
            it('responds ok', function () {
              client.get('/user', response => {
                expect(response.status).toBe(200);
              });
            });
          });
        });

        describe('right', () => {
          it("is a number that is greater than four", () => {
            expect(number).toBeGreaterThan(4);
          });
        });
      });
    `,
    dedent`
      describe('my tests', () => {
        beforeEach(() => { expect.hasAssertions(); });

        describe('left', () => {
          it('responds ok', function () {
            client.get('/user', response => {
              expect(response.status).toBe(200);
            });
          });
        });

        describe('right', () => {
          it("is a number that is greater than four", () => {
            expect(number).toBeGreaterThan(4);
          });
        });
      });
    `,
    dedent`
      describe('my tests', () => {
        beforeEach(() => { expect.hasAssertions(); });

        describe('left', () => {
          beforeEach(() => { expect.hasAssertions(); });

          it('responds ok', function () {
            client.get('/user', response => {
              expect(response.status).toBe(200);
            });
          });
        });

        describe('right', () => {
          it("is a number that is greater than four", () => {
            expect(number).toBeGreaterThan(4);
          });
        });
      });
    `,
    dedent`
      describe('my tests', () => {
        beforeEach(() => { expect.hasAssertions(); });

        describe('left', () => {
          afterEach(() => { expect.hasAssertions(); });

          it('responds ok', function () {
            client.get('/user', response => {
              expect(response.status).toBe(200);
            });
          });
        });

        describe('right', () => {
          it("is a number that is greater than four", () => {
            expect(number).toBeGreaterThan(4);
          });
        });
      });
    `,
    dedent`
      describe('my tests', () => {
        beforeEach(() => { expect.hasAssertions(); });

        it('responds ok', function () {
          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        it("is a number that is greater than four", () => {
          expect.hasAssertions();

          expect(number).toBeGreaterThan(4);
        });
      });
    `,
    // todo: this probably should not be considered valid
    //  (we should only respect expect.hasAssertions in the immediate of beforeEach)
    dedent`
      beforeEach(() => {
        setTimeout(() => expect.hasAssertions(), 5000);
      });

      it('only returns numbers that are greater than six', () => {
        for (const number of getNumbers()) {
          expect(number).toBeGreaterThan(6);
        }
      });
    `,
  ],
  invalid: [
    {
      code: 'it("it1", () => foo())',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: null,
        },
      ],
    },
    {
      code: "it('resolves', () => expect(staged()).toBe(true));",
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: null,
        },
      ],
    },
    {
      code: "it('resolves', async () => expect(await staged()).toBe(true));",
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: null,
        },
      ],
    },
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
              output: 'it("it1", () => {expect.hasAssertions(); foo()})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", () => {expect.assertions(); foo()})',
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
        });
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
                it("it1", function() {expect.hasAssertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", function() {expect.assertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });
              `,
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
        });

        describe('some tests', () => {
          beforeEach(() => { expect.hasAssertions(); });
          it("it1", function() {
            someFunctionToDo();
            someFunctionToDo2();
          });
        });
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
                it("it1", function() {expect.hasAssertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });

                describe('some tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", function() {expect.assertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });

                describe('some tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
              `,
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
        });

        describe('some tests', () => {
          afterEach(() => { expect.hasAssertions(); });
          it("it1", function() {
            someFunctionToDo();
            someFunctionToDo2();
          });
        });
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
                it("it1", function() {expect.hasAssertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });

                describe('some tests', () => {
                  afterEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", function() {expect.assertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });

                describe('some tests', () => {
                  afterEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      // todo: this should be considered valid, as hooks are evaluated before tests are run
      code: dedent`
        describe('some tests', () => {
          it("it1", function() {
            someFunctionToDo();
            someFunctionToDo2();
          });

          beforeEach(() => { expect.hasAssertions(); });

          it("it1", function() {
            someFunctionToDo();
            someFunctionToDo2();
          });
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe('some tests', () => {
                  it("it1", function() {expect.hasAssertions();
                    someFunctionToDo();
                    someFunctionToDo2();
                  });

                  beforeEach(() => { expect.hasAssertions(); });

                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe('some tests', () => {
                  it("it1", function() {expect.assertions();
                    someFunctionToDo();
                    someFunctionToDo2();
                  });

                  beforeEach(() => { expect.hasAssertions(); });

                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        describe('some tests', () => {
          beforeEach(() => { expect.hasAssertions(); });
          it("it1", function() {
            someFunctionToDo();
            someFunctionToDo2();
          });
        });

        it("it1", function() {
          someFunctionToDo();
          someFunctionToDo2();
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe('some tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });

                it("it1", function() {expect.hasAssertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe('some tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });

                it("it1", function() {expect.assertions();
                  someFunctionToDo();
                  someFunctionToDo2();
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        describe('some tests', () => {
          beforeEach(() => { expect.hasAssertions(); });
          it("it1", function() {
            someFunctionToDo();
            someFunctionToDo2();
          });
        });

        describe('more tests', () => {
          it("it1", function() {
            someFunctionToDo();
            someFunctionToDo2();
          });
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 10,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe('some tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });

                describe('more tests', () => {
                  it("it1", function() {expect.hasAssertions();
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe('some tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });
                  it("it1", function() {
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });

                describe('more tests', () => {
                  it("it1", function() {expect.assertions();
                    someFunctionToDo();
                    someFunctionToDo2();
                  });
                });
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
              output: 'it("it1", function() {expect.assertions(1,);})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions(1,2,);})',
      errors: [
        {
          messageId: 'assertionsRequiresOneArgument',
          column: 43,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.assertions(1,);})',
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
      code: 'beforeEach(() => { expect.hasAssertions("1") })',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 27,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'beforeEach(() => { expect.hasAssertions() })',
            },
          ],
        },
      ],
    },
    {
      code: 'beforeEach(() => expect.hasAssertions("1"))',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 25,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'beforeEach(() => expect.hasAssertions())',
            },
          ],
        },
      ],
    },
    {
      code: 'afterEach(() => { expect.hasAssertions("1") })',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 26,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'afterEach(() => { expect.hasAssertions() })',
            },
          ],
        },
      ],
    },
    {
      code: 'afterEach(() => expect.hasAssertions("1"))',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 24,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'afterEach(() => expect.hasAssertions())',
            },
          ],
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
      code: 'it("it1", function() {expect.hasAssertions("1",);})',
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
        });
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
                });
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
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", async function() {expect.hasAssertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", async function() {expect.assertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          for(let thing in things) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.hasAssertions();
                  for(let thing in things) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.assertions();
                  for(let thing in things) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("returns numbers that are greater than five", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(5);
          }
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    // todo: it probably makes sense to report use in beforeAll and afterAll hooks
    {
      code: dedent`
        beforeAll(() => { expect.hasAssertions(); });

        it("returns numbers that are greater than four", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("returns numbers that are greater than five", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(5);
          }
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 3,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                beforeAll(() => { expect.hasAssertions(); });

                it("returns numbers that are greater than four", async () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                beforeAll(() => { expect.hasAssertions(); });

                it("returns numbers that are greater than four", async () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => { expect.hasAssertions(); });

        it("returns numbers that are greater than four", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("returns numbers that are greater than five", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(5);
          }
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 3,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                afterAll(() => { expect.hasAssertions(); });

                it("returns numbers that are greater than four", async () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                afterAll(() => { expect.hasAssertions(); });

                it("returns numbers that are greater than four", async () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
          ],
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
          for (let number of numbers) {
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('only returns numbers that are greater than six', () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(6);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('only returns numbers that are greater than six', () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(6);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('returns numbers that are greater than two', function () {
          const expectNumbersToBeGreaterThan = (numbers, value) => {
            for (let number of numbers) {
              expect(number).toBeGreaterThan(value);
            }
          };

          expectNumbersToBeGreaterThan(getNumbers(), 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('returns numbers that are greater than two', function () {expect.hasAssertions();
                  const expectNumbersToBeGreaterThan = (numbers, value) => {
                    for (let number of numbers) {
                      expect(number).toBeGreaterThan(value);
                    }
                  };

                  expectNumbersToBeGreaterThan(getNumbers(), 2);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('returns numbers that are greater than two', function () {expect.assertions();
                  const expectNumbersToBeGreaterThan = (numbers, value) => {
                    for (let number of numbers) {
                      expect(number).toBeGreaterThan(value);
                    }
                  };

                  expectNumbersToBeGreaterThan(getNumbers(), 2);
                });
              `,
            },
          ],
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
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("only returns numbers that are greater than seven", function () {expect.hasAssertions();
                  const numbers = getNumbers();

                  for (let i = 0; i < numbers.length; i++) {
                    expect(numbers[i]).toBeGreaterThan(7);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("only returns numbers that are greater than seven", function () {expect.assertions();
                  const numbers = getNumbers();

                  for (let i = 0; i < numbers.length; i++) {
                    expect(numbers[i]).toBeGreaterThan(7);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('has the number two', () => {
          expect(number).toBe(2);
        });

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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('has the number two', () => {
                  expect(number).toBe(2);
                });

                it('only returns numbers that are less than twenty', () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeLessThan(20);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('has the number two', () => {
                  expect(number).toBe(2);
                });

                it('only returns numbers that are less than twenty', () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeLessThan(20);
                  }
                });
              `,
            },
          ],
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
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 3,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("is wrong");

                it("is a test", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("is wrong");

                it("is a test", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });

        it("returns numbers that are greater than four", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("returns numbers that are greater than five", () => {
          expect(number).toBeGreaterThan(5);
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 5,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });

                it("returns numbers that are greater than four", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  expect(number).toBeGreaterThan(5);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });

                it("returns numbers that are greater than four", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {
                  expect(number).toBeGreaterThan(5);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it.each([1, 2, 3])("returns numbers that are greater than four", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it.each([1, 2, 3])("returns numbers that are greater than four", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("is a number that is greater than four", () => {
                  expect.hasAssertions();

                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("is a number that is greater than four", () => {
                  expect.hasAssertions();

                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });

                it("it1", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });

                it("it1", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.hasAssertions();
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
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {expect.assertions();
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
            },
          ],
        },
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 7,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {
                  for (const number of await getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", async () => {
                  for (const number of await getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("returns numbers that are greater than five", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(5);
                  }
                });
              `,
            },
          ],
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
        });

        it("it1", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", async () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("it1", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", async () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("it1", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        describe('my tests', () => {
          beforeEach(() => { expect.hasAssertions(); });
 
          it("it1", async () => {
            for (const number of getNumbers()) {
              expect(number).toBeGreaterThan(4);
            }
          });
        });

        it("it1", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 11,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe('my tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });

                  it("it1", async () => {
                    for (const number of getNumbers()) {
                      expect(number).toBeGreaterThan(4);
                    }
                  });
                });

                it("it1", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe('my tests', () => {
                  beforeEach(() => { expect.hasAssertions(); });

                  it("it1", async () => {
                    for (const number of getNumbers()) {
                      expect(number).toBeGreaterThan(4);
                    }
                  });
                });

                it("it1", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        describe('my tests', () => {
          afterEach(() => { expect.hasAssertions(); });
 
          it("it1", async () => {
            for (const number of getNumbers()) {
              expect(number).toBeGreaterThan(4);
            }
          });
        });

        it("it1", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 11,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe('my tests', () => {
                  afterEach(() => { expect.hasAssertions(); });

                  it("it1", async () => {
                    for (const number of getNumbers()) {
                      expect(number).toBeGreaterThan(4);
                    }
                  });
                });

                it("it1", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe('my tests', () => {
                  afterEach(() => { expect.hasAssertions(); });

                  it("it1", async () => {
                    for (const number of getNumbers()) {
                      expect(number).toBeGreaterThan(4);
                    }
                  });
                });

                it("it1", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
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
        });

        it("it1", () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it.skip.each\`\`("it1", async () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("it1", () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it.skip.each\`\`("it1", async () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("it1", () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });

        it("it1", () => {
          expect.hasAssertions();

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", async () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("it1", () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", async () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });

                it("it1", () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        describe('my tests', () => {
          it("it1", async () => {
            for (const number of getNumbers()) {
              expect(number).toBeGreaterThan(4);
            }
          });
        });

        it("it1", () => {
          expect.hasAssertions();

          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      options: [{ onlyFunctionsWithExpectInLoop: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe('my tests', () => {
                  it("it1", async () => {expect.hasAssertions();
                    for (const number of getNumbers()) {
                      expect(number).toBeGreaterThan(4);
                    }
                  });
                });

                it("it1", () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe('my tests', () => {
                  it("it1", async () => {expect.assertions();
                    for (const number of getNumbers()) {
                      expect(number).toBeGreaterThan(4);
                    }
                  });
                });

                it("it1", () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
        },
      ],
    },
  ],
});

ruleTester.run('prefer-expect-assertions (callbacks)', rule, {
  valid: [
    {
      code: dedent`
        const expectNumbersToBeGreaterThan = (numbers, value) => {
          numbers.forEach(number => {
            expect(number).toBeGreaterThan(value);
          });
        };

        it('returns numbers that are greater than two', function () {
          expectNumbersToBeGreaterThan(getNumbers(), 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it('returns numbers that are greater than two', function () {
          expect.assertions(2);

          const expectNumbersToBeGreaterThan = (numbers, value) => {
            for (let number of numbers) {
              expect(number).toBeGreaterThan(value);
            }
          };

          expectNumbersToBeGreaterThan(getNumbers(), 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        beforeEach(() => expect.hasAssertions());

        it('returns numbers that are greater than two', function () {
          const expectNumbersToBeGreaterThan = (numbers, value) => {
            for (let number of numbers) {
              expect(number).toBeGreaterThan(value);
            }
          };

          expectNumbersToBeGreaterThan(getNumbers(), 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it("returns numbers that are greater than five", function () {
          expect.assertions(2);

          getNumbers().forEach(number => {
            expect(number).toBeGreaterThan(5);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it("returns things that are less than ten", function () {
          expect.hasAssertions();

          things.forEach(thing => {
            expect(thing).toBeLessThan(10);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it('sends the data as a string', () => {
          expect.hasAssertions();

          const stream = openStream();

          stream.on('data', data => {
            expect(data).toBe(expect.any(String));
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it('responds ok', function () {
          expect.assertions(1);

          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it.each([1, 2, 3])("returns ok", id => {
          expect.assertions(3);

          client.get(\`/users/$\{id}\`, response => {
            expect(response.status).toBe(200);
          });
        });

        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it('is a test', () => {
          expect(expected).toBe(actual);
        });

        describe('my test', () => {
          it('is another test', () => {
            expect(expected).toBe(actual);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it('responds ok', function () {
          expect.assertions(1);

          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        describe('my test', () => {
          beforeEach(() => expect.hasAssertions());

          it('responds ok', function () {
            client.get('/user', response => {
              expect(response.status).toBe(200);
            });
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
    {
      code: dedent`
        it('responds ok', function () {
          expect.assertions(1);

          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        describe('my test', () => {
          afterEach(() => expect.hasAssertions());

          it('responds ok', function () {
            client.get('/user', response => {
              expect(response.status).toBe(200);
            });
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
    },
  ],
  invalid: [
    {
      code: dedent`
        it('sends the data as a string', () => {
          const stream = openStream();

          stream.on('data', data => {
            expect(data).toBe(expect.any(String));
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('sends the data as a string', () => {expect.hasAssertions();
                  const stream = openStream();

                  stream.on('data', data => {
                    expect(data).toBe(expect.any(String));
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('sends the data as a string', () => {expect.assertions();
                  const stream = openStream();

                  stream.on('data', data => {
                    expect(data).toBe(expect.any(String));
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('responds ok', function () {
          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('responds ok', function () {expect.hasAssertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('responds ok', function () {expect.assertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('responds ok', function () {
          client.get('/user', response => {
            expect.assertions(1);

            expect(response.status).toBe(200);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('responds ok', function () {expect.hasAssertions();
                  client.get('/user', response => {
                    expect.assertions(1);

                    expect(response.status).toBe(200);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('responds ok', function () {expect.assertions();
                  client.get('/user', response => {
                    expect.assertions(1);

                    expect(response.status).toBe(200);
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('responds ok', function () {
          const expectOkResponse = response => {
            expect.assertions(1);

            expect(response.status).toBe(200);
          };

          client.get('/user', expectOkResponse);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('responds ok', function () {expect.hasAssertions();
                  const expectOkResponse = response => {
                    expect.assertions(1);

                    expect(response.status).toBe(200);
                  };

                  client.get('/user', expectOkResponse);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('responds ok', function () {expect.assertions();
                  const expectOkResponse = response => {
                    expect.assertions(1);

                    expect(response.status).toBe(200);
                  };

                  client.get('/user', expectOkResponse);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('returns numbers that are greater than two', function () {
          const expectNumberToBeGreaterThan = (number, value) => {
            expect(number).toBeGreaterThan(value);
          };

          expectNumberToBeGreaterThan(1, 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('returns numbers that are greater than two', function () {expect.hasAssertions();
                  const expectNumberToBeGreaterThan = (number, value) => {
                    expect(number).toBeGreaterThan(value);
                  };

                  expectNumberToBeGreaterThan(1, 2);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('returns numbers that are greater than two', function () {expect.assertions();
                  const expectNumberToBeGreaterThan = (number, value) => {
                    expect(number).toBeGreaterThan(value);
                  };

                  expectNumberToBeGreaterThan(1, 2);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('returns numbers that are greater than two', function () {
          const expectNumbersToBeGreaterThan = (numbers, value) => {
            for (let number of numbers) {
              expect(number).toBeGreaterThan(value);
            }
          };

          expectNumbersToBeGreaterThan(getNumbers(), 2);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('returns numbers that are greater than two', function () {expect.hasAssertions();
                  const expectNumbersToBeGreaterThan = (numbers, value) => {
                    for (let number of numbers) {
                      expect(number).toBeGreaterThan(value);
                    }
                  };

                  expectNumbersToBeGreaterThan(getNumbers(), 2);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('returns numbers that are greater than two', function () {expect.assertions();
                  const expectNumbersToBeGreaterThan = (numbers, value) => {
                    for (let number of numbers) {
                      expect(number).toBeGreaterThan(value);
                    }
                  };

                  expectNumbersToBeGreaterThan(getNumbers(), 2);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('only returns numbers that are greater than six', () => {
          getNumbers().forEach(number => {
            expect(number).toBeGreaterThan(6);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('only returns numbers that are greater than six', () => {expect.hasAssertions();
                  getNumbers().forEach(number => {
                    expect(number).toBeGreaterThan(6);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('only returns numbers that are greater than six', () => {expect.assertions();
                  getNumbers().forEach(number => {
                    expect(number).toBeGreaterThan(6);
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("is wrong");

        it('responds ok', function () {
          const expectOkResponse = response => {
            expect.assertions(1);

            expect(response.status).toBe(200);
          };

          client.get('/user', expectOkResponse);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 3,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("is wrong");

                it('responds ok', function () {expect.hasAssertions();
                  const expectOkResponse = response => {
                    expect.assertions(1);

                    expect(response.status).toBe(200);
                  };

                  client.get('/user', expectOkResponse);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("is wrong");

                it('responds ok', function () {expect.assertions();
                  const expectOkResponse = response => {
                    expect.assertions(1);

                    expect(response.status).toBe(200);
                  };

                  client.get('/user', expectOkResponse);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });

        it('responds ok', function () {
          const expectOkResponse = response => {
            expect(response.status).toBe(200);
          };

          client.get('/user', expectOkResponse);
        });

        it("returns numbers that are greater than five", () => {
          expect(number).toBeGreaterThan(5);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 5,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });

                it('responds ok', function () {expect.hasAssertions();
                  const expectOkResponse = response => {
                    expect(response.status).toBe(200);
                  };

                  client.get('/user', expectOkResponse);
                });

                it("returns numbers that are greater than five", () => {
                  expect(number).toBeGreaterThan(5);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });

                it('responds ok', function () {expect.assertions();
                  const expectOkResponse = response => {
                    expect(response.status).toBe(200);
                  };

                  client.get('/user', expectOkResponse);
                });

                it("returns numbers that are greater than five", () => {
                  expect(number).toBeGreaterThan(5);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });

        it("returns numbers that are greater than four", () => {
          getNumbers().map(number => {
            expect(number).toBeGreaterThan(0);
          });
        });

        it("returns numbers that are greater than five", () => {
          expect(number).toBeGreaterThan(5);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 5,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });

                it("returns numbers that are greater than four", () => {expect.hasAssertions();
                  getNumbers().map(number => {
                    expect(number).toBeGreaterThan(0);
                  });
                });

                it("returns numbers that are greater than five", () => {
                  expect(number).toBeGreaterThan(5);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });

                it("returns numbers that are greater than four", () => {expect.assertions();
                  getNumbers().map(number => {
                    expect(number).toBeGreaterThan(0);
                  });
                });

                it("returns numbers that are greater than five", () => {
                  expect(number).toBeGreaterThan(5);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it.each([1, 2, 3])("returns ok", id => {
          client.get(\`/users/$\{id}\`, response => {
            expect(response.status).toBe(200);
          });
        });

        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it.each([1, 2, 3])("returns ok", id => {expect.hasAssertions();
                  client.get(\`/users/$\{id}\`, response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it.each([1, 2, 3])("returns ok", id => {expect.assertions();
                  client.get(\`/users/$\{id}\`, response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('responds ok', function () {
          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        it("is a number that is greater than four", () => {
          expect(number).toBeGreaterThan(4);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('responds ok', function () {expect.hasAssertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('responds ok', function () {expect.assertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("is a number that is greater than four", () => {
                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('responds ok', function () {
          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        it("is a number that is greater than four", () => {
          expect.hasAssertions();

          expect(number).toBeGreaterThan(4);
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('responds ok', function () {expect.hasAssertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("is a number that is greater than four", () => {
                  expect.hasAssertions();

                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('responds ok', function () {expect.assertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("is a number that is greater than four", () => {
                  expect.hasAssertions();

                  expect(number).toBeGreaterThan(4);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", () => {
          expect.hasAssertions();

          getNumbers().forEach(number => {
            expect(number).toBeGreaterThan(0);
          });
        });

        it("it1", () => {
          getNumbers().forEach(number => {
            expect(number).toBeGreaterThan(0);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", () => {
                  expect.hasAssertions();

                  getNumbers().forEach(number => {
                    expect(number).toBeGreaterThan(0);
                  });
                });

                it("it1", () => {expect.hasAssertions();
                  getNumbers().forEach(number => {
                    expect(number).toBeGreaterThan(0);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", () => {
                  expect.hasAssertions();

                  getNumbers().forEach(number => {
                    expect(number).toBeGreaterThan(0);
                  });
                });

                it("it1", () => {expect.assertions();
                  getNumbers().forEach(number => {
                    expect(number).toBeGreaterThan(0);
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('responds ok', function () {
          expect.hasAssertions();

          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        it('responds not found', function () {
          client.get('/user', response => {
            expect(response.status).toBe(404);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('responds ok', function () {
                  expect.hasAssertions();

                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it('responds not found', function () {expect.hasAssertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(404);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('responds ok', function () {
                  expect.hasAssertions();

                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it('responds not found', function () {expect.assertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(404);
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it.skip.each\`\`("it1", async () => {
          expect.hasAssertions();

          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });

        it("responds ok", () => {
          client.get('/user', response => {
            expect(response.status).toBe(200);
          });
        });
      `,
      options: [{ onlyFunctionsWithExpectInCallback: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 9,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it.skip.each\`\`("it1", async () => {
                  expect.hasAssertions();

                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("responds ok", () => {expect.hasAssertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it.skip.each\`\`("it1", async () => {
                  expect.hasAssertions();

                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });

                it("responds ok", () => {expect.assertions();
                  client.get('/user', response => {
                    expect(response.status).toBe(200);
                  });
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("returns numbers that are greater than four", function(expect) {
          expect.assertions(2);

          for(let thing in things) {
            expect(number).toBeGreaterThan(4);
          }
        });
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          endColumn: 3,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("returns numbers that are greater than four", function(expect) {expect.hasAssertions();
                  expect.assertions(2);

                  for(let thing in things) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("returns numbers that are greater than four", function(expect) {expect.assertions();
                  expect.assertions(2);

                  for(let thing in things) {
                    expect(number).toBeGreaterThan(4);
                  }
                });
              `,
            },
          ],
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
        });
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
        });
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('only returns numbers that are greater than zero', () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });

                it("is zero", () => {
                  expect.hasAssertions();

                  expect(0).toBe(0);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('only returns numbers that are greater than zero', () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });

                it("is zero", () => {
                  expect.hasAssertions();

                  expect(0).toBe(0);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('only returns numbers that are greater than zero', () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });

                it('only returns numbers that are less than 100', () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeLessThan(0);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('only returns numbers that are greater than zero', () => {
                  expect.hasAssertions();

                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });

                it('only returns numbers that are less than 100', () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeLessThan(0);
                  }
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("to be true", async function() {expect.hasAssertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("to be true", async function() {expect.assertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it('only returns numbers that are greater than zero', async () => {
          for (const number of getNumbers()) {
            expect(number).toBeGreaterThan(0);
          }
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it('only returns numbers that are greater than zero', async () => {expect.hasAssertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it('only returns numbers that are greater than zero', async () => {expect.assertions();
                  for (const number of getNumbers()) {
                    expect(number).toBeGreaterThan(0);
                  }
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                test.each()("is not fine", () => {expect.hasAssertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                test.each()("is not fine", () => {expect.assertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe.each()('something', () => {
                  it("is not fine", () => {expect.hasAssertions();
                    expect(someValue).toBe(true);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe.each()('something', () => {
                  it("is not fine", () => {expect.assertions();
                    expect(someValue).toBe(true);
                  });
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe.each()('something', () => {
                  test.each()("is not fine", () => {expect.hasAssertions();
                    expect(someValue).toBe(true);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe.each()('something', () => {
                  test.each()("is not fine", () => {expect.assertions();
                    expect(someValue).toBe(true);
                  });
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                test.each()("is not fine", async () => {expect.hasAssertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                test.each()("is not fine", async () => {expect.assertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it.each()("is not fine", async () => {expect.hasAssertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it.each()("is not fine", async () => {expect.assertions();
                  expect(someValue).toBe(true);
                });
              `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                describe.each()('something', () => {
                  test.each()("is not fine", async () => {expect.hasAssertions();
                    expect(someValue).toBe(true);
                  });
                });
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                describe.each()('something', () => {
                  test.each()("is not fine", async () => {expect.assertions();
                    expect(someValue).toBe(true);
                  });
                });
              `,
            },
          ],
        },
      ],
    },
  ],
});
