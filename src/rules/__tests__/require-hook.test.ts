import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../require-hook';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('require-hook', rule, {
  valid: [
    dedent`
      test('it', () => {
        //
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
  ],
  invalid: [
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
  ],
});
