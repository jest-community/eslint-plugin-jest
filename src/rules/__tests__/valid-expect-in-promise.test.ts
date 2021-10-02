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
        const [promise] = [
          something().then(value => {
            expect(value).toBe('red');
          })
        ];
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
        { column: 3, endColumn: 6, messageId: 'returnPromise', line: 8 },
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
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('it1', () => {
          somePromise.finally(() => {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
    },
    {
      code: `
       it('it1', () => {
         somePromise['then'](() => {
           expect(someThing).toEqual(true);
         });
       });
      `,
      errors: [{ column: 10, endColumn: 13, messageId: 'returnPromise' }],
    },
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
        xtest('it1', function() {
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
          Builder.getPromiseBuilder()
            .get()
            .build()
            .then(data => expect(data).toEqual('Hi'));
        });
      `,
      errors: [{ column: 3, endColumn: 47, messageId: 'returnPromise' }],
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
      errors: [{ column: 11, endColumn: 55, messageId: 'returnPromise' }],
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
        it('is a test', () => {
          somePromise
            .then(() => {})
            .then(() => expect(someThing).toEqual(value))
        });
      `,
      errors: [{ column: 3, endColumn: 50, messageId: 'returnPromise' }],
    },
    {
      code: dedent`
        it('is a test', () => {
          somePromise
            .then(() => expect(someThing).toEqual(value))
            .then(() => {})
        });
      `,
      errors: [{ column: 3, endColumn: 20, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 35, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 22, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 5, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
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
      errors: [{ column: 3, endColumn: 6, messageId: 'returnPromise' }],
    },
  ],
});
