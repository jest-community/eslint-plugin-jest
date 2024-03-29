import dedent from 'dedent';
import rule from '../require-hook';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('require-hook', rule, {
  valid: [
    'describe()',
    'describe("just a title")',
    dedent`
      describe('a test', () =>
        test('something', () => {
          expect(true).toBe(true);
        }));
    `,
    dedent`
      test('it', () => {
        //
      });
    `,
    dedent`
      const { myFn } = require('../functions');

      test('myFn', () => {
        expect(myFn()).toBe(1);
      });
    `,
    {
      code: dedent`
        import { myFn } from '../functions';

        test('myFn', () => {
          expect(myFn()).toBe(1);
        });
      `,
      parserOptions: { sourceType: 'module' },
    },
    dedent`
      class MockLogger {
        log() {}
      }

      test('myFn', () => {
        expect(myFn()).toBe(1);
      });
    `,
    dedent`
      const { myFn } = require('../functions');

      describe('myFn', () => {
        it('returns one', () => {
          expect(myFn()).toBe(1);
        });
      });
    `,
    dedent`
      describe('some tests', () => {
        it('is true', () => {
          expect(true).toBe(true);
        });
      });
    `,
    dedent`
      describe('some tests', () => {
        it('is true', () => {
          expect(true).toBe(true);
        });

        describe('more tests', () => {
          it('is false', () => {
            expect(true).toBe(false);
          });
        });
      });
    `,
    dedent`
      describe('some tests', () => {
        let consoleLogSpy;

        beforeEach(() => {
          consoleLogSpy = jest.spyOn(console, 'log'); 
        });

        it('prints a message', () => {
          printMessage('hello world');

          expect(consoleLogSpy).toHaveBeenCalledWith('hello world');
        });
      });
    `,
    dedent`
      let consoleErrorSpy = null; 

      beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error');
      });
    `,
    dedent`
      let consoleErrorSpy = undefined; 

      beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error');
      });
    `,
    dedent`
      describe('some tests', () => {
        beforeEach(() => {
          setup();
        });
      });
    `,
    dedent`
      beforeEach(() => {
        initializeCityDatabase();
      });

      afterEach(() => {
        clearCityDatabase();
      });

      test('city database has Vienna', () => {
        expect(isCity('Vienna')).toBeTruthy();
      });

      test('city database has San Juan', () => {
        expect(isCity('San Juan')).toBeTruthy();
      });
    `,
    dedent`
      describe('cities', () => {
        beforeEach(() => {
          initializeCityDatabase();
        });

        test('city database has Vienna', () => {
          expect(isCity('Vienna')).toBeTruthy();
        });

        test('city database has San Juan', () => {
          expect(isCity('San Juan')).toBeTruthy();
        });

        afterEach(() => {
          clearCityDatabase();
        });
      });
    `,
    {
      code: dedent`
        enableAutoDestroy(afterEach);
        
        describe('some tests', () => {
          it('is false', () => {
            expect(true).toBe(true);
          });
        });
      `,
      options: [{ allowedFunctionCalls: ['enableAutoDestroy'] }],
    },
  ],
  invalid: [
    {
      code: 'setup();',
      errors: [
        {
          messageId: 'useHook',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: dedent`
        describe('some tests', () => {
          setup();
        });
      `,
      errors: [
        {
          messageId: 'useHook',
          line: 2,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        let { setup } = require('./test-utils');

        describe('some tests', () => {
          setup();
        });
      `,
      errors: [
        {
          messageId: 'useHook',
          line: 1,
          column: 1,
        },
        {
          messageId: 'useHook',
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('some tests', () => {
          setup();

          it('is true', () => {
            expect(true).toBe(true);
          });

          describe('more tests', () => {
            setup();

            it('is false', () => {
              expect(true).toBe(false);
            });
          });
        });
      `,
      errors: [
        {
          messageId: 'useHook',
          line: 2,
          column: 3,
        },
        {
          messageId: 'useHook',
          line: 9,
          column: 5,
        },
      ],
    },
    {
      code: dedent`
        let consoleErrorSpy = jest.spyOn(console, 'error');

        describe('when loading cities from the api', () => {
          let consoleWarnSpy = jest.spyOn(console, 'warn');
        });
      `,
      errors: [
        {
          messageId: 'useHook',
          line: 1,
          column: 1,
        },
        {
          messageId: 'useHook',
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: dedent`
        let consoleErrorSpy = null;

        describe('when loading cities from the api', () => {
          let consoleWarnSpy = jest.spyOn(console, 'warn');
        });
      `,
      errors: [
        {
          messageId: 'useHook',
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: 'let value = 1',
      errors: [
        {
          messageId: 'useHook',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "let consoleErrorSpy, consoleWarnSpy = jest.spyOn(console, 'error');",
      errors: [
        {
          messageId: 'useHook',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "let consoleErrorSpy = jest.spyOn(console, 'error'), consoleWarnSpy;",
      errors: [
        {
          messageId: 'useHook',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: dedent`
        import { database, isCity } from '../database';
        import { loadCities } from '../api';

        jest.mock('../api');

        const initializeCityDatabase = () => {
          database.addCity('Vienna');
          database.addCity('San Juan');
          database.addCity('Wellington');
        };

        const clearCityDatabase = () => {
          database.clear();
        };

        initializeCityDatabase();

        test('that persists cities', () => {
          expect(database.cities.length).toHaveLength(3);
        });

        test('city database has Vienna', () => {
          expect(isCity('Vienna')).toBeTruthy();
        });

        test('city database has San Juan', () => {
          expect(isCity('San Juan')).toBeTruthy();
        });

        describe('when loading cities from the api', () => {
          let consoleWarnSpy = jest.spyOn(console, 'warn');

          loadCities.mockResolvedValue(['Wellington', 'London']);

          it('does not duplicate cities', async () => {
            await database.loadCities();

            expect(database.cities).toHaveLength(4);
          });

          it('logs any duplicates', async () => {
            await database.loadCities();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
              'Ignored duplicate cities: Wellington',
            );
          });
        });

        clearCityDatabase();
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'useHook',
          line: 16,
          column: 1,
        },
        {
          messageId: 'useHook',
          line: 31,
          column: 3,
        },
        {
          messageId: 'useHook',
          line: 33,
          column: 3,
        },
        {
          messageId: 'useHook',
          line: 50,
          column: 1,
        },
      ],
    },
    {
      code: dedent`
        enableAutoDestroy(afterEach);
        
        describe('some tests', () => {
          it('is false', () => {
            expect(true).toBe(true);
          });
        });
      `,
      options: [{ allowedFunctionCalls: ['someOtherName'] }],
      errors: [
        {
          messageId: 'useHook',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});

new FlatCompatRuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
}).run('require-hook: typescript edition', rule, {
  valid: [
    dedent`
      import { myFn } from '../functions';

      // todo: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56545
      declare module 'eslint' {
        namespace ESLint {
          interface LintResult {
            fatalErrorCount: number;
          }
        }
      }

      test('myFn', () => {
        expect(myFn()).toBe(1);
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        import { setup } from '../test-utils';

        // todo: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56545
        declare module 'eslint' {
          namespace ESLint {
            interface LintResult {
              fatalErrorCount: number;
            }
          }
        }

        describe('some tests', () => {
          setup();
        });
      `,
      errors: [
        {
          messageId: 'useHook',
          line: 13,
          column: 3,
        },
      ],
    },
  ],
});
