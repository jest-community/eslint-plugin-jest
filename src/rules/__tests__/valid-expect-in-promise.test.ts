import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../valid-expect-in-promise';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('valid-expect-in-promise', rule, {
  valid: [
    dedent`
      it('it1', () => new Promise((done) => {
        test()
          .then(() => {
            expect(someThing).toEqual(true);
            done();
          });
      }));
    `,
    dedent`
      it('it1', () => {
        return somePromise.then(() => {
          expect(someThing).toEqual(true);
        });
      });
    `,
    dedent`
      it('it1', function() {
        return somePromise.catch(function() {
          expect(someThing).toEqual(true);
        });
      });
    `,
    dedent`
      it('it1', function() {
        return somePromise.then(function() {
          doSomeThingButNotExpect();
        });
      });
    `,
    dedent`
      it('it1', function() {
        return getSomeThing().getPromise().then(function() {
          expect(someThing).toEqual(true);
        });
      });
    `,
    dedent`
      it('it1', function() {
        return Promise.resolve().then(function() {
          expect(someThing).toEqual(true);
        });
      });
    `,
    dedent`
      it('it1', function () {
        return Promise.resolve().then(function () {
          /*fulfillment*/
          expect(someThing).toEqual(true);
        }, function () {
          /*rejection*/
          expect(someThing).toEqual(true);
        });
      });
    `,
    dedent`
      it('it1', function () {
        return Promise.resolve().then(function () {
          /*fulfillment*/
        }, function () {
          /*rejection*/
          expect(someThing).toEqual(true);
        });
      });
    `,
    dedent`
      it('it1', function () {
        return somePromise.then()
      });
    `,
    dedent`
      it('it1', async () => {
        await Promise.resolve().then(function () {
          expect(someThing).toEqual(true)
        });
      });
    `,
    dedent`
      it('it1', async () => {
        await somePromise.then(() => {
          expect(someThing).toEqual(true)
        });
      });
    `,
    dedent`
      it('it1', async () => {
        await getSomeThing().getPromise().then(function () {
          expect(someThing).toEqual(true)
        });
      });
    `,
    dedent`
      it('it1', () => {
        return somePromise.then(() => {
          expect(someThing).toEqual(true);
        })
        .then(() => {
          expect(someThing).toEqual(true);
        })
      });
    `,
    dedent`
      it('it1', () => {
        return somePromise.then(() => {
          expect(someThing).toEqual(true);
        })
        .catch(() => {
          expect(someThing).toEqual(false);
        })
      });
    `,
    dedent`
      test('later return', () => {
        const promise = something().then(value => {
          expect(value).toBe('red');
        });
        
        return promise;
      });
    `,
    dedent`
      it('shorthand arrow', () =>
        something().then(value => {
          expect(() => {
            value();
          }).toThrow();
        })
      );
    `,
    dedent`
      it('promise test', () => {
        const somePromise = getThatPromise();
        somePromise.then((data) => {
          expect(data).toEqual('foo');
        });
        expect(somePromise).toBeDefined();
        return somePromise;
      });
    `,
    dedent`
      test('promise test', function () {
        let somePromise = getThatPromise();
        somePromise.then((data) => {
          expect(data).toEqual('foo');
        });
        expect(somePromise).toBeDefined();
        return somePromise;
      });
    `,
    dedent`
      it('crawls for files based on patterns', () => {
        const promise = nodeCrawl({}).then(data => {
          expect(childProcess.spawn).lastCalledWith('find');
        });
        return promise;
      });
    `,
    dedent`
      it(
        'test function',
        () => {
          return Builder
            .getPromiseBuilder()
            .get().build()
            .then((data) => {
              expect(data).toEqual('Hi');
            });
        }
      );
    `,
    dedent`
      notATestFunction(
        'not a test function',
        () => {
          Builder
            .getPromiseBuilder()
            .get()
            .build()
            .then((data) => {
              expect(data).toEqual('Hi');
            });
        }
      );
    `,
    dedent`
      it("it1", () => somePromise.then(() => {
        expect(someThing).toEqual(true)
      }))
    `,
    'it("it1", () => somePromise.then(() => expect(someThing).toEqual(true)))',
    dedent`
      it('promise test with done', (done) => {
        const promise = getPromise();
        promise.then(() => expect(someThing).toEqual(true));
      });
    `,
    dedent`
      it('name of done param does not matter', (nameDoesNotMatter) => {
        const promise = getPromise();
        promise.then(() => expect(someThing).toEqual(true));
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        it('it1', () => {
          somePromise.then(() => {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
    },
    // {
    //   code: `
    //      it('it1', () => {
    //        somePromise['then'](() => {
    //          expect(someThing).toEqual(true);
    //        });
    //      });
    //   `,
    //   errors: [{ column: 12, endColumn: 15, messageId: 'returnPromise' }],
    // },
    {
      code: dedent`
        it('it1', function() {
          getSomeThing().getPromise().then(function() {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('it1', function() {
          Promise.resolve().then(function() {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('it1', function() {
          somePromise.catch(function() {
            expect(someThing).toEqual(true)
          })
        })
      `,
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('it1', function() {
          somePromise.then(function() {
            expect(someThing).toEqual(true)
          })
        })
      `,
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('it1', function () {
          Promise.resolve().then(/*fulfillment*/ function () {
            expect(someThing).toEqual(true);
          }, /*rejection*/ function () {
            expect(someThing).toEqual(true);
          })
        })
      `,
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('it1', function () {
          Promise.resolve().then(/*fulfillment*/ function () {
          }, /*rejection*/ function () {
            expect(someThing).toEqual(true)
          })
        });
      `,
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('test function', () => {
          Builder.getPromiseBuilder().get().build().then((data) => expect(data).toEqual('Hi'));
        });
      `,
      errors: [{ column: 3, endColumn: 88, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('it1', () => {
          somePromise.then(() => {
            doSomeOperation();
            expect(someThing).toEqual(true);
          })
        });
      `,
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        test('invalid return', () => {
          const promise = something().then(value => {
            const foo = "foo";
            return expect(value).toBe('red');
          });
        });
      `,
      errors: [{ column: 9, endColumn: 5, messageId: 'returnPromise' }],
    },
  ],
});
