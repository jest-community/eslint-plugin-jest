import dedent from 'dedent';
import rule from '../prefer-mock-return-shorthand';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
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
    'jest.fn().mockReturnValue(42)',
    'jest.fn(() => Promise.resolve(42))',
    'jest.fn(() => 42)',
    'jest.fn(() => ({}))',
    'aVariable.mockImplementation',
    'aVariable.mockImplementation()',
    dedent`
      aVariable.mockImplementation(() => {
        if (true) {
          return 1;
        }

        return 2;
      });
    `,
    'aVariable.mockReturnValue()',
    'aVariable.mockReturnValue(1)',
    'aVariable.mockReturnValue("hello world")',
    "jest.spyOn(Thingy, 'method').mockImplementation(param => param * 2);",
    "jest.spyOn(Thingy, 'method').mockImplementation(param => true ? param : 0);",
    dedent`
      aVariable.mockImplementation(() => {
        const value = new Date();

        return Promise.resolve(value);
      });
    `,
    dedent`
      aVariable.mockImplementation(() => {
        throw new Error('oh noes!');
      });
    `,
    'aVariable.mockImplementation(() => { /* do something */ });',
    dedent`
      aVariable.mockImplementation(() => {
        const x = 1;

        console.log(x + 2);
      });
    `,
    'aVariable.mockReturnValue(Promise.all([1, 2, 3]));',
    dedent`
      let currentX = 0;
      jest.spyOn(X, getCount).mockImplementation(() => currentX);

      // stuff happens

      currentX++;

      // more stuff happens
    `,
    dedent`
      let currentX = 0;
      jest.spyOn(X, getCount).mockImplementation(() => currentX);
    `,
    dedent`
      let currentX = 0;
      currentX = 0;
      jest.spyOn(X, getCount).mockImplementation(() => currentX);
    `,
    dedent`
      var currentX = 0;
      currentX = 0;
      jest.spyOn(X, getCount).mockImplementation(() => currentX);
    `,
    dedent`
      var currentX = 0;
      var currentX = 0;
      jest.spyOn(X, getCount).mockImplementation(() => currentX);
    `,
    dedent`
      let doSomething = () => {};

      jest.spyOn(X, getCount).mockImplementation(() => doSomething);
    `,
    dedent`
      let currentX = 0;
      jest.spyOn(X, getCount).mockImplementation(() => {
        currentX += 1;

        return currentX;
      });
    `,
    dedent`
      const currentX = 0;
      jest.spyOn(X, getCount).mockImplementation(() => {
        console.log('returning', currentX);

        return currentX;
      });
    `,
  ],

  invalid: [
    {
      code: 'jest.fn().mockImplementation(() => "hello sunshine")',
      output: 'jest.fn().mockReturnValue("hello sunshine")',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    ...['null', '0', 'Promise.resolve(42)', 'Promise.reject(13)', '[]'].flatMap(
      value => [
        {
          code: `jest.fn().mockImplementation(() => ${value})`,
          output: `jest.fn().mockReturnValue(${value})`,
          errors: [
            {
              messageId: 'useMockShorthand' as const,
              data: { replacement: 'mockReturnValue' },
              column: 11,
              line: 1,
            },
          ],
        },
        {
          code: dedent`
            jest.fn().mockImplementation(() => {
              return ${value};
            })
          `,
          output: `jest.fn().mockReturnValue(${value})`,
          errors: [
            {
              messageId: 'useMockShorthand' as const,
              data: { replacement: 'mockReturnValue' },
              column: 11,
              line: 1,
            },
          ],
        },
        {
          code: `aVariable.mockImplementation(() => ${value})`,
          output: `aVariable.mockReturnValue(${value})`,
          errors: [
            {
              messageId: 'useMockShorthand' as const,
              data: { replacement: 'mockReturnValue' },
              column: 11,
              line: 1,
            },
          ],
        },
        {
          code: dedent`
            aVariable.mockImplementation(() => {
              return ${value};
            })
          `,
          output: `aVariable.mockReturnValue(${value})`,
          errors: [
            {
              messageId: 'useMockShorthand' as const,
              data: { replacement: 'mockReturnValue' },
              column: 11,
              line: 1,
            },
          ],
        },
      ],
    ),

    {
      code: 'jest.fn().mockImplementation(() => ({}))',
      output: `jest.fn().mockReturnValue({})`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockImplementation(() => x)',
      output: `jest.fn().mockReturnValue(x)`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockImplementation(() => true ? x : y)',
      output: `jest.fn().mockReturnValue(true ? x : y)`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        jest.fn().mockImplementation(function () {
          return "hello world";
        })
      `,
      output: `jest.fn().mockReturnValue("hello world")`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.fn().mockImplementation(() => "hello world")',
      output: `jest.fn().mockReturnValue("hello world")`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        jest.fn().mockImplementation(() => {
          return "hello world";
        })
      `,
      output: `jest.fn().mockReturnValue("hello world")`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockImplementation(() => "hello world")',
      output: 'aVariable.mockReturnValue("hello world")',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable.mockImplementation(() => {
          return "hello world";
        })
      `,
      output: 'aVariable.mockReturnValue("hello world")',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },

    {
      code: 'jest.fn().mockImplementationOnce(() => "hello world")',
      output: `jest.fn().mockReturnValueOnce("hello world")`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'aVariable.mockImplementationOnce(() => "hello world")',
      output: `aVariable.mockReturnValueOnce("hello world")`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValueOnce' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable.mockImplementation(() => ({
          target: 'world',
          message: 'hello'
        }))
      `,
      output: dedent`
        aVariable.mockReturnValue({
          target: 'world',
          message: 'hello'
        })
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable
          .mockImplementation(() => 42)
          .mockImplementation(() => Promise.resolve(42))
          .mockReturnValue("hello world")
      `,
      output: dedent`
        aVariable
          .mockReturnValue(42)
          .mockReturnValue(Promise.resolve(42))
          .mockReturnValue("hello world")
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 4,
          line: 2,
        },
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 4,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        aVariable
          .mockImplementationOnce(() => Promise.reject(42))
          .mockImplementation(() => "hello sunshine")
          .mockReturnValueOnce(Promise.reject(42))
      `,
      output: dedent`
        aVariable
          .mockReturnValueOnce(Promise.reject(42))
          .mockReturnValue("hello sunshine")
          .mockReturnValueOnce(Promise.reject(42))
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValueOnce' },
          column: 4,
          line: 2,
        },
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 4,
          line: 3,
        },
      ],
    },
    {
      code: 'jest.fn().mockImplementation(() => [], xyz)',
      output: 'jest.fn().mockReturnValue([], xyz)',
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.spyOn(fs, "readFile").mockImplementation(() => new Error("oh noes!"))',
      output: `jest.spyOn(fs, "readFile").mockReturnValue(new Error("oh noes!"))`,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 28,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable.mockImplementation(() => {
          return Promise.resolve(value)
            .then(value => value + 1);
        });
      `,
      output: dedent`
        aVariable.mockReturnValue(Promise.resolve(value)
            .then(value => value + 1));
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        aVariable.mockImplementation(() => {
          return Promise.all([1, 2, 3]);
        });
      `,
      output: dedent`
        aVariable.mockReturnValue(Promise.all([1, 2, 3]));
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        const currentX = 0;
        jest.spyOn(X, getCount).mockImplementation(() => currentX);
      `,
      output: dedent`
        const currentX = 0;
        jest.spyOn(X, getCount).mockReturnValue(currentX);
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 25,
          line: 2,
        },
      ],
    },
    // currently we assume that exported stuff is immutable, since that
    // is generally considered a bad idea especially when testing
    {
      code: dedent`
        import { currentX } from './elsewhere';
        jest.spyOn(X, getCount).mockImplementation(() => currentX);
      `,
      output: dedent`
        import { currentX } from './elsewhere';
        jest.spyOn(X, getCount).mockReturnValue(currentX);
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 25,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        const currentX = 0;

        describe('some tests', () => {
          it('works', () => {
            jest.spyOn(X, getCount).mockImplementation(() => currentX);
          });
        });
      `,
      output: dedent`
        const currentX = 0;

        describe('some tests', () => {
          it('works', () => {
            jest.spyOn(X, getCount).mockReturnValue(currentX);
          });
        });
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 29,
          line: 5,
        },
      ],
    },
    {
      code: dedent`
        function doSomething() {};

        jest.spyOn(X, getCount).mockImplementation(() => doSomething);
      `,
      output: dedent`
        function doSomething() {};

        jest.spyOn(X, getCount).mockReturnValue(doSomething);
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 25,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const doSomething = () => {};

        jest.spyOn(X, getCount).mockImplementation(() => doSomething);
      `,
      output: dedent`
        const doSomething = () => {};

        jest.spyOn(X, getCount).mockReturnValue(doSomething);
      `,
      errors: [
        {
          messageId: 'useMockShorthand',
          data: { replacement: 'mockReturnValue' },
          column: 25,
          line: 3,
        },
      ],
    },
  ],
});
