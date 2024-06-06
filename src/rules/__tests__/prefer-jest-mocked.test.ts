import dedent from 'dedent';
import rule from '../prefer-jest-mocked';
import { FlatCompatRuleTester as RuleTester } from './test-utils';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('prefer-jest-mocked', rule, {
  valid: [
    `foo();`,
    `jest.mocked(foo).mockReturnValue(1);`,
    `bar.mockReturnValue(1);`,
    `sinon.stub(foo).returns(1);`,
    `foo.mockImplementation(() => 1);`,
    `obj.foo();`,
    `mockFn.mockReturnValue(1);`,
    `arr[0]();`,
    `obj.foo.mockReturnValue(1);`,
    `jest.spyOn(obj, 'foo').mockReturnValue(1);`,
    `(foo as Mock.jest).mockReturnValue(1);`,

    dedent`
      type MockType = jest.Mock;
      const mockFn = jest.fn();
      (mockFn as MockType).mockReturnValue(1);
    `,
  ],
  invalid: [
    {
      code: `(foo as jest.Mock).mockReturnValue(1);`,
      output: `(jest.mocked(foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 18,
          endLine: 1,
        },
      ],
    },
    {
      code: `(foo as unknown as string as unknown as jest.Mock).mockReturnValue(1);`,
      output: `(jest.mocked(foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 50,
          endLine: 1,
        },
      ],
    },
    {
      code: `(foo as unknown as jest.Mock as unknown as jest.Mock).mockReturnValue(1);`,
      output: `(jest.mocked(foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 53,
          endLine: 1,
        },
      ],
    },
    {
      code: `(<jest.Mock>foo).mockReturnValue(1);`,
      output: `(jest.mocked(foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 16,
          endLine: 1,
        },
      ],
    },
    {
      code: `(foo as jest.Mock).mockImplementation(1);`,
      output: `(jest.mocked(foo)).mockImplementation(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 18,
          endLine: 1,
        },
      ],
    },
    {
      code: `(foo as unknown as jest.Mock).mockReturnValue(1);`,
      output: `(jest.mocked(foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 29,
          endLine: 1,
        },
      ],
    },
    {
      code: `(<jest.Mock>foo as unknown).mockReturnValue(1);`,
      output: `(jest.mocked(foo) as unknown).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 16,
          endLine: 1,
        },
      ],
    },
    {
      code: `(Obj.foo as jest.Mock).mockReturnValue(1);`,
      output: `(jest.mocked(Obj.foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 22,
          endLine: 1,
        },
      ],
    },
    {
      code: `([].foo as jest.Mock).mockReturnValue(1);`,
      output: `(jest.mocked([].foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 21,
          endLine: 1,
        },
      ],
    },
    {
      code: `(foo as jest.MockedFunction).mockReturnValue(1);`,
      output: `(jest.mocked(foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 28,
          endLine: 1,
        },
      ],
    },
    {
      code: `(foo as jest.MockedFunction).mockImplementation(1);`,
      output: `(jest.mocked(foo)).mockImplementation(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 28,
          endLine: 1,
        },
      ],
    },
    {
      code: `(foo as unknown as jest.MockedFunction).mockReturnValue(1);`,
      output: `(jest.mocked(foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 39,
          endLine: 1,
        },
      ],
    },
    {
      code: `(Obj.foo as jest.MockedFunction).mockReturnValue(1);`,
      output: `(jest.mocked(Obj.foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 32,
          endLine: 1,
        },
      ],
    },
    {
      code: `(new Array(0).fill(null).foo as jest.MockedFunction).mockReturnValue(1);`,
      output: `(jest.mocked(new Array(0).fill(null).foo)).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 52,
          endLine: 1,
        },
      ],
    },
    {
      code: `(jest.fn(() => foo) as jest.MockedFunction).mockReturnValue(1);`,
      output: `(jest.mocked(jest.fn(() => foo))).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 43,
          endLine: 1,
        },
      ],
    },
    {
      code: `const mockedUseFocused = useFocused as jest.MockedFunction<typeof useFocused>;`,
      output: `const mockedUseFocused = jest.mocked(useFocused);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 26,
          line: 1,
          endColumn: 78,
          endLine: 1,
        },
      ],
    },
    {
      code: `const filter = (MessageService.getMessage as jest.Mock).mock.calls[0][0];`,
      output: `const filter = (jest.mocked(MessageService.getMessage)).mock.calls[0][0];`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 17,
          line: 1,
          endColumn: 55,
          endLine: 1,
        },
      ],
    },
    {
      code: dedent`
        class A {}
        (foo as jest.MockedClass<A>)
      `,
      output: dedent`
        class A {}
        (jest.mocked(foo))
      `,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 2,
          endColumn: 28,
          endLine: 2,
        },
      ],
    },
    {
      code: `(foo as jest.MockedObject<{method: () => void}>)`,
      output: `(jest.mocked(foo))`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 48,
          endLine: 1,
        },
      ],
    },
    {
      code: `(Obj['foo'] as jest.MockedFunction).mockReturnValue(1);`,
      output: `(jest.mocked(Obj['foo'])).mockReturnValue(1);`,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 2,
          line: 1,
          endColumn: 35,
          endLine: 1,
        },
      ],
    },
    {
      code: dedent`
        (
          new Array(100)
            .fill(undefined)
            .map(x => x.value)
            .filter(v => !!v).myProperty as jest.MockedFunction<{
            method: () => void;
          }>
        ).mockReturnValue(1);
      `,
      output: dedent`
        (
          jest.mocked(new Array(100)
            .fill(undefined)
            .map(x => x.value)
            .filter(v => !!v).myProperty)
        ).mockReturnValue(1);
      `,
      options: [],
      errors: [
        {
          messageId: 'useJestMocked',
          column: 3,
          line: 2,
          endColumn: 5,
          endLine: 7,
        },
      ],
    },
  ],
});
