import rule from '../prefer-to-have-been-called-times';
import { FlatCompatRuleTester as RuleTester } from './test-utils';

const ruleTester = new RuleTester();

ruleTester.run('prefer-to-have-been-called-times', rule, {
  valid: [
    'expect.assertions(1)',
    'expect(fn).toHaveBeenCalledTimes',
    'expect(fn.mock.calls).toHaveLength',
    'expect(fn.mock.values).toHaveLength(0)',
    'expect(fn.values.calls).toHaveLength(0)',
    'expect(fn).toHaveBeenCalledTimes(0)',
    'expect(fn).resolves.toHaveBeenCalledTimes(10)',
    'expect(fn).not.toHaveBeenCalledTimes(10)',
    'expect(fn).toHaveBeenCalledTimes(1)',
    'expect(fn).toBeCalledTimes(0);',
    'expect(fn).toHaveBeenCalledTimes(0);',
    'expect(fn);',
    'expect(method.mock.calls[0][0]).toStrictEqual(value);',
    'expect(fn.mock.length).toEqual(1);',
    'expect(fn.mock.calls).toEqual([]);',
    'expect(fn.mock.calls).toContain(1, 2, 3);',
  ],

  invalid: [
    {
      code: 'expect(method.mock.calls).toHaveLength(1);',
      output: 'expect(method).toHaveBeenCalledTimes(1);',
      errors: [
        {
          messageId: 'preferMatcher',
          column: 27,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(method.mock.calls).resolves.toHaveLength(x);',
      output: 'expect(method).resolves.toHaveBeenCalledTimes(x);',
      errors: [
        {
          messageId: 'preferMatcher',
          column: 36,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(method["mock"].calls).toHaveLength(0);',
      output: 'expect(method).toHaveBeenCalledTimes(0);',
      errors: [
        {
          messageId: 'preferMatcher',
          column: 30,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(my.method.mock.calls).not.toHaveLength(0);',
      output: 'expect(my.method).not.toHaveBeenCalledTimes(0);',
      errors: [
        {
          messageId: 'preferMatcher',
          column: 34,
          line: 1,
        },
      ],
    },
  ],
});
