import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../no-untyped-mock-factory';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-untyped-mock-factory', rule, {
  valid: [
    "jest.mock('random-number');",
    dedent`
      jest.mock<typeof import('../moduleName')>('../moduleName', () => {
        return jest.fn(() => 42);
      });
    `,
    dedent`
      jest.mock<typeof import('./module')>('./module', () => ({
        ...jest.requireActual('./module'),
        foo: jest.fn()
      }));
    `,
    dedent`
      jest.mock<typeof import('foo')>('bar', () => ({
        ...jest.requireActual('bar'),
        foo: jest.fn()
      }));
    `,
    dedent`
      jest.doMock('./module', (): typeof import('./module') => ({
        ...jest.requireActual('./module'),
        foo: jest.fn()
      }));
    `,
    dedent`
      jest.mock('../moduleName', function (): typeof import('../moduleName') {
        return jest.fn(() => 42);
      });
    `,
    dedent`
      jest.mock<() => number>('random-num', () => {
        return jest.fn(() => 42);
      });
    `,
    dedent`
      jest['doMock']<() => number>('random-num', () => {
        return jest.fn(() => 42);
      });
    `,
    dedent`
      jest.mock<any>('random-num', () => {
        return jest.fn(() => 42);
      });
    `,
    dedent`
      jest.mock(
        '../moduleName',
        () => {
          return jest.fn(() => 42)
        },
        {virtual: true},
      );
    `,
    dedent`
      jest.mock('../moduleName', function (): (() => number) {
        return jest.fn(() => 42);
      });
    `,
    // Should not match
    dedent`
      mockito<() => number>('foo', () => {
        return jest.fn(() => 42);
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        jest.mock('../moduleName', () => {
          return jest.fn(() => 42);
        });
      `,
      output: dedent`
        jest.mock<typeof import('../moduleName')>('../moduleName', () => {
          return jest.fn(() => 42);
        });
      `,
      errors: [{ messageId: 'addTypeParameterToModuleMock' }],
    },
    {
      code: dedent`
        jest.mock("./module", () => ({
          ...jest.requireActual('./module'),
          foo: jest.fn()
        }));
      `,
      output: dedent`
        jest.mock<typeof import("./module")>("./module", () => ({
          ...jest.requireActual('./module'),
          foo: jest.fn()
        }));
      `,
      errors: [{ messageId: 'addTypeParameterToModuleMock' }],
    },
    {
      code: dedent`
        jest.mock('random-num', () => {
          return jest.fn(() => 42);
        });
      `,
      output: dedent`
        jest.mock<typeof import('random-num')>('random-num', () => {
          return jest.fn(() => 42);
        });
      `,
      errors: [{ messageId: 'addTypeParameterToModuleMock' }],
    },
    {
      code: dedent`
        jest.doMock('random-num', () => {
          return jest.fn(() => 42);
        });
      `,
      output: dedent`
        jest.doMock<typeof import('random-num')>('random-num', () => {
          return jest.fn(() => 42);
        });
      `,
      errors: [{ messageId: 'addTypeParameterToModuleMock' }],
    },
    {
      code: dedent`
        jest['mock']('random-num', () => {
          return jest.fn(() => 42);
        });
      `,
      output: dedent`
        jest['mock']<typeof import('random-num')>('random-num', () => {
          return jest.fn(() => 42);
        });
      `,
      errors: [{ messageId: 'addTypeParameterToModuleMock' }],
    },
    {
      code: dedent`
        const moduleToMock = 'random-num';
        jest.mock(moduleToMock, () => {
          return jest.fn(() => 42);
        });
      `,
      output: null,
      errors: [{ messageId: 'addTypeParameterToModuleMock' }],
    },
  ],
});
