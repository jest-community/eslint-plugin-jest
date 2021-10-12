import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import rule from '../valid-expect-in-promise';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('valid-expect-in-promise', rule, {
  valid: [
    "test('something', () => Promise.resolve().then(() => expect(1).toBe(2)));",
    'Promise.resolve().then(() => expect(1).toBe(2))',
    'const x = Promise.resolve().then(() => expect(1).toBe(2))',
    dedent`
      it('is valid', async () => {
        const promise = loadNumber().then(number => {
          expect(typeof number).toBe('number');

          return number + 1;
        });

        expect(await promise).toBeGreaterThan(1);
      });
    `,
    dedent`
      it('is valid', async () => {
        const promise = loadNumber().then(number => {
          expect(typeof number).toBe('number');

          return number + 1;
        });

        expect(await promise).resolves.toBeGreaterThan(1);
      });
    `,
    dedent`
      it('is valid', async () => {
        const promise = loadNumber().then(number => {
          expect(typeof number).toBe('number');

          return number + 1;
        });

        expect(1).toBeGreaterThan(await promise);
      });
    `,
    dedent`
      it('is valid', async () => {
        const promise = loadNumber().then(number => {
          expect(typeof number).toBe('number');

          return number + 1;
        });

        expect.this.that.is(await promise);
      });
    `,
    dedent`
      it('is valid', async () => {
        expect(await loadNumber().then(number => {
          expect(typeof number).toBe('number');

          return number + 1;
        })).toBeGreaterThan(1);
      });
    `,
    dedent`
      it('is valid', async () => {
        const promise = loadNumber().then(number => {
          expect(typeof number).toBe('number');

          return number + 1;
        });

        logValue(await promise);
      });
    `,
    dedent`
      it('is valid', async () => {
        const promise = loadNumber().then(number => {
          expect(typeof number).toBe('number');

          return 1;
        });

        expect.assertions(await promise);
      });
    `,
    dedent`
      it('is valid', async () => {
        await loadNumber().then(number => {
          expect(typeof number).toBe('number');
        });
      });
    `,
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
        return new Promise(done => {
          test().then(() => {
            expect(someThing).toEqual(true);
            done();
          });
        });
      });
    `,
    dedent`
      it('passes', () => {
        Promise.resolve().then(() => {
          grabber.grabSomething();
        });
      });
    `,
    dedent`
      it('passes', async () => {
        const grabbing = Promise.resolve().then(() => {
          grabber.grabSomething();
        });

        await grabbing;

        expect(grabber.grabbedItems).toHaveLength(1);
      });
    `,
    dedent`
      const myFn = () => {
        Promise.resolve().then(() => {
          expect(true).toBe(false);
        });
      };
    `,
    dedent`
      const myFn = () => {
        Promise.resolve().then(() => {
          subject.invokeMethod();
        });
      };
    `,
    dedent`
      const myFn = () => {
        Promise.resolve().then(() => {
          expect(true).toBe(false);
        });
      };

      it('it1', () => {
        return somePromise.then(() => {
          expect(someThing).toEqual(true);
        });
      });
    `,
    dedent`
      it('it1', () => new Promise((done) => {
        test()
          .finally(() => {
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
      it('it1', () => {
        return somePromise.finally(() => {
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
      xtest('it1', function() {
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
        Promise.resolve().then(/*fulfillment*/ function () {
        }, undefined, /*rejection*/ function () {
          expect(someThing).toEqual(true)
        })
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
          return value;
        })
        .then(value => {
          expect(someThing).toEqual(value);
        })
      });
    `,
    dedent`
      it('it1', () => {
        return somePromise.then(() => {
          expect(someThing).toEqual(true);
        })
        .then(() => {
          console.log('this is silly');
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
      test('later return', async () => {
        const promise = something().then(value => {
          expect(value).toBe('red');
        });

        await promise;
      });
    `,
    dedent`
      test.only('later return', () => {
        const promise = something().then(value => {
          expect(value).toBe('red');
        });

        return promise;
      });
    `,
    dedent`
      test('that we bailout if destructuring is used', () => {
        const [promise] = something().then(value => {
          expect(value).toBe('red');
        });
      });
    `,
    dedent`
      test('that we bailout if destructuring is used', async () => {
        const [promise] = await something().then(value => {
          expect(value).toBe('red');
        });
      });
    `,
    dedent`
      test('that we bailout if destructuring is used', () => {
        const [promise] = [
          something().then(value => {
            expect(value).toBe('red');
          })
        ];
      });
    `,
    dedent`
      test('that we bailout if destructuring is used', () => {
        const {promise} = {
          promise: something().then(value => {
            expect(value).toBe('red');
          })
        };
      });
    `,
    dedent`
      test('that we bailout in complex cases', () => {
        promiseSomething({
          timeout: 500,
          promise: something().then(value => {
            expect(value).toBe('red');
          })
        });
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
      it('crawls for files based on patterns', () => {
        const promise = nodeCrawl({}).then(data => {
          expect(childProcess.spawn).lastCalledWith('find');
        });
        return promise;
      });
    `,
    dedent`
      it('is a test', async () => {
        const value = await somePromise().then(response => {
          expect(response).toHaveProperty('data');

          return response.data;
        });

        expect(value).toBe('hello world');
      });
    `,
    dedent`
      it('is a test', async () => {
        return await somePromise().then(response => {
          expect(response).toHaveProperty('data');

          return response.data;
        });
      });
    `,
    dedent`
      it('is a test', async () => {
        return somePromise().then(response => {
          expect(response).toHaveProperty('data');

          return response.data;
        });
      });
    `,
    dedent`
      it('is a test', async () => {
        await somePromise().then(response => {
          expect(response).toHaveProperty('data');

          return response.data;
        });
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
      it('is valid', async () => {
        const promiseOne = loadNumber().then(number => {
          expect(typeof number).toBe('number');
        });
        const promiseTwo = loadNumber().then(number => {
          expect(typeof number).toBe('number');
        });

        await promiseTwo;
        await promiseOne;
      });
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
    dedent`
      it.each([])('name of done param does not matter', (nameDoesNotMatter) => {
        const promise = getPromise();
        promise.then(() => expect(someThing).toEqual(true));
      });
    `,
    dedent`
      it.each\`\`('name of done param does not matter', ({}, nameDoesNotMatter) => {
        const promise = getPromise();
        promise.then(() => expect(someThing).toEqual(true));
      });
    `,
    dedent`
      test('valid-expect-in-promise', async () => {
        const text = await fetch('url')
            .then(res => res.text())
            .then(text => text);

        expect(text).toBe('text');
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        }), x = 1;

        await somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        let x = 1, somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await somePromise;

        somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        }); 

        await somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await somePromise;

        somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        }); 

        return somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        {}

        await somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        const somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        {
          await somePromise;
        }
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        {
          await somePromise;

          somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          });

          await somePromise;
        }
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await somePromise;

        {
          somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          });

          await somePromise;
        }
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        somePromise = somePromise.then((data) => {
          expect(data).toEqual('foo');
        }); 

        await somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        somePromise = somePromise
          .then((data) => data)
          .then((data) => data)
          .then((data) => {
            expect(data).toEqual('foo');
          }); 

        await somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        somePromise = somePromise
          .then((data) => data)
          .then((data) => data)

        await somePromise;
      });
    `,
    dedent`
      test('promise test', async function () {
        let somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await somePromise;

        {
          somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          });

          {
            await somePromise;
          }
        }
      });
    `,
    dedent`
      test('promise test', async function () {
        const somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await Promise.all([somePromise]);
      });
    `,
    dedent`
      test('promise test', async function () {
        const somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        return Promise.all([somePromise]);
      });
    `,
    dedent`
      test('promise test', async function () {
        const somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        return Promise.resolve(somePromise);
      });
    `,
    dedent`
      test('promise test', async function () {
        const somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        return Promise.reject(somePromise);
      });
    `,
    dedent`
      test('promise test', async function () {
        const somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await Promise.resolve(somePromise);
      });
    `,
    dedent`
      test('promise test', async function () {
        const somePromise = getPromise().then((data) => {
          expect(data).toEqual('foo');
        });

        await Promise.reject(somePromise);
      });
    `,
    dedent`
      test('later return', async () => {
        const onePromise = something().then(value => {
          console.log(value);
        });
        const twoPromise = something().then(value => {
          expect(value).toBe('red');
        });

        return Promise.all([onePromise, twoPromise]);
      });
    `,
    dedent`
      test('later return', async () => {
        const onePromise = something().then(value => {
          console.log(value);
        });
        const twoPromise = something().then(value => {
          expect(value).toBe('red');
        });

        return Promise.allSettled([onePromise, twoPromise]);
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        const myFn = () => {
          Promise.resolve().then(() => {
            expect(true).toBe(false);
          });
        };

        it('it1', () => {
          somePromise.then(() => {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [
        {
          column: 3,
          endColumn: 6,
          messageId: 'expectInFloatingPromise',
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        it('it1', () => {
          somePromise.then(() => {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [
        { column: 3, endColumn: 6, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('it1', () => {
          somePromise.finally(() => {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [
        { column: 3, endColumn: 6, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: `
       it('it1', () => {
         somePromise['then'](() => {
           expect(someThing).toEqual(true);
         });
       });
      `,
      errors: [
        { column: 10, endColumn: 13, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('it1', function() {
          getSomeThing().getPromise().then(function() {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [
        { column: 3, endColumn: 6, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('it1', function() {
          Promise.resolve().then(function() {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [
        { column: 3, endColumn: 6, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('it1', function() {
          somePromise.catch(function() {
            expect(someThing).toEqual(true)
          })
        })
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        xtest('it1', function() {
          somePromise.catch(function() {
            expect(someThing).toEqual(true)
          })
        })
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('it1', function() {
          somePromise.then(function() {
            expect(someThing).toEqual(true)
          })
        })
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
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
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
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
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('test function', () => {
          Builder.getPromiseBuilder()
            .get()
            .build()
            .then(data => expect(data).toEqual('Hi'));
        });
      `,
      errors: [
        { column: 3, endColumn: 47, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: `
        it('test function', async () => {
          Builder.getPromiseBuilder()
            .get()
            .build()
            .then(data => expect(data).toEqual('Hi'));
        });
      `,
      errors: [
        { column: 11, endColumn: 55, messageId: 'expectInFloatingPromise' },
      ],
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
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise
            .then(() => {})
            .then(() => expect(someThing).toEqual(value))
        });
      `,
      errors: [
        { column: 3, endColumn: 50, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise
            .then(() => expect(someThing).toEqual(value))
            .then(() => {})
        });
      `,
      errors: [
        { column: 3, endColumn: 20, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise.then(() => {
            return value;
          })
          .then(value => {
            expect(someThing).toEqual(value);
          })
        });
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise.then(() => {
            expect(someThing).toEqual(true);
          })
          .then(() => {
            console.log('this is silly');
          })
        });
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise.then(() => {
            // return value;
          })
          .then(value => {
            expect(someThing).toEqual(value);
          })
        });
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise.then(() => {
            return value;
          })
          .then(value => {
            expect(someThing).toEqual(value);
          })

          return anotherPromise.then(() => expect(x).toBe(y));
        });
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise
            .then(() => 1)
            .then(x => x + 1)
            .catch(() => -1)
            .then(v => expect(v).toBe(2));

          return anotherPromise.then(() => expect(x).toBe(y));
        });
      `,
      errors: [
        { column: 3, endColumn: 35, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise
            .then(() => 1)
            .then(v => expect(v).toBe(2))
            .then(x => x + 1)
            .catch(() => -1);

          return anotherPromise.then(() => expect(x).toBe(y));
        });
      `,
      errors: [
        { column: 3, endColumn: 22, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('it1', () => {
          somePromise.finally(() => {
            doSomeOperation();
            expect(someThing).toEqual(true);
          })
        });
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
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
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        fit('it1', () => {
          somePromise.then(() => {
            doSomeOperation();
            expect(someThing).toEqual(true);
          })
        });
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it.skip('it1', () => {
          somePromise.then(() => {
            doSomeOperation();
            expect(someThing).toEqual(true);
          })
        });
      `,
      errors: [
        { column: 3, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          promise;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          return;

          await promise;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          return 1;

          await promise;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          return [];

          await promise;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          return Promise.all([anotherPromise]);

          await promise;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          return {};

          await promise;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          return Promise.all([]);

          await promise;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          await 1;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          await [];
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          await Promise.all([anotherPromise]);
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          await {};
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          await Promise.all([]);
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          }), x = 1;
        });
      `,
      errors: [
        { column: 9, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('later return', async () => {
          const x = 1, promise = something().then(value => {
            expect(value).toBe('red');
          });
        });
      `,
      errors: [
        { column: 16, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        it('promise test', () => {
          const somePromise = getThatPromise();
          somePromise.then((data) => {
            expect(data).toEqual('foo');
          });
          expect(somePromise).toBeDefined();
          return somePromise;
        });
      `,
      errors: [
        { column: 3, endColumn: 6, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('promise test', function () {
          let somePromise = getThatPromise();
          somePromise.then((data) => {
            expect(data).toEqual('foo');
          });
          expect(somePromise).toBeDefined();
          return somePromise;
        });
      `,
      errors: [
        { column: 3, endColumn: 6, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('promise test', async function () {
          let somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          });

          somePromise = null;

          await somePromise;
        });
      `,
      errors: [
        { column: 7, endColumn: 5, messageId: 'expectInFloatingPromise' },
      ],
    },
    {
      code: dedent`
        test('promise test', async function () {
          let somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          });

          somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          }); 

          await somePromise;
        });
      `,
      errors: [
        {
          column: 7,
          endColumn: 5,
          line: 2,
          messageId: 'expectInFloatingPromise',
        },
      ],
    },
    {
      code: dedent`
        test('promise test', async function () {
          let somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          });
  
          ({ somePromise } = {})
        });
      `,
      errors: [
        {
          column: 7,
          endColumn: 5,
          line: 2,
          messageId: 'expectInFloatingPromise',
        },
      ],
    },
    {
      code: dedent`
        test('promise test', async function () {
          let somePromise = getPromise().then((data) => {
            expect(data).toEqual('foo');
          });

          {
            somePromise = getPromise().then((data) => {
              expect(data).toEqual('foo');
            }); 

            await somePromise;
          }
        });
      `,
      errors: [
        {
          column: 7,
          endColumn: 5,
          line: 2,
          messageId: 'expectInFloatingPromise',
        },
      ],
    },
    {
      code: dedent`
        test('that we error on this destructuring', async () => {
          [promise] = something().then(value => {
            expect(value).toBe('red');
          });
        });
      `,
      errors: [
        {
          column: 3,
          endColumn: 5,
          line: 2,
          messageId: 'expectInFloatingPromise',
        },
      ],
    },
    {
      code: dedent`
        test('that we error on this', () => {
          const promise = something().then(value => {
            expect(value).toBe('red');
          });

          log(promise);
        });
      `,
      errors: [
        {
          messageId: 'expectInFloatingPromise',
          line: 2,
          column: 9,
        },
      ],
    },
  ],
});
