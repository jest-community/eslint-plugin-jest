import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-mock-promise-shorthand';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('prefer-mock-shorthand', rule, {
  valid: [
    'describe()',
    'it()',
    'describe.skip()',
    'it.skip()',
    'test()',
    'test.skip()',
    'var appliedOnly = describe.only; appliedOnly.apply(describe)',
    'var calledOnly = it.only; calledOnly.call(it)',
    'it.each()()',
    'it.each`table`()',
    'test.each()()',
    'test.each`table`()',
    'test.concurrent()',
    'jest.fn().mockResolvedValue(42)',
    'jest.fn(() => Promise.resolve(42))',
    'jest.fn(() => Promise.reject(42))',
    'aVariable.mockImplementation',
    'aVariable.mockImplementation()',
    'aVariable.mockImplementation([])',
    'aVariable.mockImplementation(() => {})',
    'aVariable.mockImplementation(() => [])',
    'aVariable.mockReturnValue(() => Promise.resolve(1))',
    'aVariable.mockReturnValue(Promise.resolve(1).then(() => 1))',
    'aVariable.mockReturnValue(Promise.reject(1).then(() => 1))',
    'aVariable.mockReturnValue(Promise.reject().then(() => 1))',
    'aVariable.mockReturnValue(new Promise(resolve => resolve(1)))',
    'aVariable.mockReturnValue(new Promise((_, reject) => reject(1)))',
    dedent`
      aVariable.mockImplementation(() => {
        const value = new Date();

        return Promise.resolve(value);
      });
    `,
    dedent`
      aVariable.mockImplementation(() => {
        return Promise.resolve(value)
          .then(value => value + 1);
      });
    `,
    dedent`
      aVariable.mockImplementation(() => {
        return Promise.all([1, 2, 3]);
      });
    `,
    'aVariable.mockImplementation(() => Promise.all([1, 2, 3]));',
    'aVariable.mockReturnValue(Promise.all([1, 2, 3]));',
  ],

  invalid: [
    {
      code: 'jest.fn().mockImplementation(() => Promise.resolve(42))',
      output: 'jest.fn().mockResolvedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockImplementation(() => Promise.reject(42))',
      output: 'jest.fn().mockRejectedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockImplementation(() => Promise.resolve(42))',
      output: 'aVariable.mockResolvedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable.mockImplementation(() => {
          return Promise.resolve(42)
        })
      `,
      output: 'aVariable.mockResolvedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockImplementation(() => Promise.reject(42))',
      output: 'aVariable.mockRejectedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockImplementationOnce(() => Promise.resolve(42))',
      output: 'aVariable.mockResolvedValueOnce(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockImplementationOnce(() => Promise.reject(42))',
      output: 'aVariable.mockRejectedValueOnce(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockReturnValue(Promise.resolve(42))',
      output: 'jest.fn().mockResolvedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockReturnValue(Promise.reject(42))',
      output: 'jest.fn().mockRejectedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockReturnValue(Promise.resolve(42))',
      output: 'aVariable.mockResolvedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockReturnValue(Promise.reject(42))',
      output: 'aVariable.mockRejectedValue(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockReturnValueOnce(Promise.resolve(42))',
      output: 'aVariable.mockResolvedValueOnce(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockReturnValueOnce(Promise.reject(42))',
      output: 'aVariable.mockRejectedValueOnce(42)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable.mockReturnValue(Promise.resolve({
          target: 'world',
          message: 'hello'
        }))
      `,
      output: dedent`
        aVariable.mockResolvedValue({
          target: 'world',
          message: 'hello'
        })
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable
          .mockImplementation(() => Promise.reject(42))
          .mockImplementation(() => Promise.resolve(42))
          .mockReturnValue(Promise.reject(42))
      `,
      output: dedent`
        aVariable
          .mockRejectedValue(42)
          .mockResolvedValue(42)
          .mockRejectedValue(42)
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 4,
          line: 2,
        },
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 4,
          line: 3,
        },
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 4,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        aVariable
          .mockReturnValueOnce(Promise.reject(42))
          .mockImplementation(() => Promise.resolve(42))
          .mockReturnValueOnce(Promise.reject(42))
      `,
      output: dedent`
        aVariable
          .mockRejectedValueOnce(42)
          .mockResolvedValue(42)
          .mockRejectedValueOnce(42)
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValueOnce' },
          column: 4,
          line: 2,
        },
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 4,
          line: 3,
        },
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValueOnce' },
          column: 4,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        aVariable.mockReturnValueOnce(
          Promise.reject(
            new Error('oh noes!')
          )
        )
      `,
      output: dedent`
        aVariable.mockRejectedValueOnce(
          new Error('oh noes!')
        )
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockReturnValue(Promise.resolve(42), xyz)',
      output: 'jest.fn().mockResolvedValue(42, xyz)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockImplementation(() => Promise.reject(42), xyz)',
      output: 'jest.fn().mockRejectedValue(42, xyz)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockReturnValueOnce(Promise.resolve(42, xyz))',
      output: null,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockReturnValueOnce(Promise.resolve())',
      output: 'aVariable.mockResolvedValueOnce(undefined)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockResolvedValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.spyOn(fs, "readFile").mockReturnValue(Promise.reject(new Error("oh noes!")))',
      output: `jest.spyOn(fs, "readFile").mockRejectedValue(new Error("oh noes!"))`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockRejectedValue' },
          column: 28,
          line: 1,
        },
      ],
    },
  ],
});
