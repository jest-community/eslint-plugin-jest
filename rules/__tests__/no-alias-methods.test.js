'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-alias-methods');

const ruleTester = new RuleTester();

ruleTester.run('no-alias-methods', rule, {
  valid: [
    'expect(a).toHaveBeenCalled()',
    'expect(a).toHaveBeenCalledTimes()',
    'expect(a).toHaveBeenCalledWith()',
    'expect(a).toHaveBeenLastCalledWith()',
    'expect(a).toHaveBeenNthCalledWith()',
    'expect(a).toHaveReturned()',
    'expect(a).toHaveReturnedTimes()',
    'expect(a).toHaveReturnedWith()',
    'expect(a).toHaveLastReturnedWith()',
    'expect(a).toHaveNthReturnedWith()',
    'expect(a).toThrow()',
    'expect(a).rejects;',
  ],

  invalid: [
    {
      code: 'expect(a).toBeCalled()',
      errors: [
        {
          message:
            'Replace toBeCalled() with its canonical name of toHaveBeenCalled()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveBeenCalled()',
    },
    {
      code: 'expect(a).toBeCalledTimes()',
      errors: [
        {
          message:
            'Replace toBeCalledTimes() with its canonical name of toHaveBeenCalledTimes()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveBeenCalledTimes()',
    },
    {
      code: 'expect(a).toBeCalledWith()',
      errors: [
        {
          message:
            'Replace toBeCalledWith() with its canonical name of toHaveBeenCalledWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveBeenCalledWith()',
    },
    {
      code: 'expect(a).lastCalledWith()',
      errors: [
        {
          message:
            'Replace lastCalledWith() with its canonical name of toHaveBeenLastCalledWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveBeenLastCalledWith()',
    },
    {
      code: 'expect(a).nthCalledWith()',
      errors: [
        {
          message:
            'Replace nthCalledWith() with its canonical name of toHaveBeenNthCalledWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveBeenNthCalledWith()',
    },
    {
      code: 'expect(a).toReturn()',
      errors: [
        {
          message:
            'Replace toReturn() with its canonical name of toHaveReturned()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveReturned()',
    },
    {
      code: 'expect(a).toReturnTimes()',
      errors: [
        {
          message:
            'Replace toReturnTimes() with its canonical name of toHaveReturnedTimes()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveReturnedTimes()',
    },
    {
      code: 'expect(a).toReturnWith()',
      errors: [
        {
          message:
            'Replace toReturnWith() with its canonical name of toHaveReturnedWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveReturnedWith()',
    },
    {
      code: 'expect(a).lastReturnedWith()',
      errors: [
        {
          message:
            'Replace lastReturnedWith() with its canonical name of toHaveLastReturnedWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveLastReturnedWith()',
    },
    {
      code: 'expect(a).nthReturnedWith()',
      errors: [
        {
          message:
            'Replace nthReturnedWith() with its canonical name of toHaveNthReturnedWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toHaveNthReturnedWith()',
    },
    {
      code: 'expect(a).toThrowError()',
      errors: [
        {
          message:
            'Replace toThrowError() with its canonical name of toThrow()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toThrow()',
    },
    {
      code: 'expect(a).resolves.toThrowError()',
      errors: [
        {
          message:
            'Replace toThrowError() with its canonical name of toThrow()',
          column: 20,
          line: 1,
        },
      ],
      output: 'expect(a).resolves.toThrow()',
    },
    {
      code: 'expect(a).rejects.toThrowError()',
      errors: [
        {
          message:
            'Replace toThrowError() with its canonical name of toThrow()',
          column: 19,
          line: 1,
        },
      ],
      output: 'expect(a).rejects.toThrow()',
    },
    {
      code: 'expect(a).not.toThrowError()',
      errors: [
        {
          message:
            'Replace toThrowError() with its canonical name of toThrow()',
          column: 15,
          line: 1,
        },
      ],
      output: 'expect(a).not.toThrow()',
    },
  ],
});

ruleTester.run('no-alias-methods with short', rule, {
  valid: [
    'expect(a).toBeCalled()',
    'expect(a).toBeCalledTimes()',
    'expect(a).toBeCalledWith()',
    'expect(a).lastCalledWith()',
    'expect(a).nthCalledWith()',
    'expect(a).toReturn()',
    'expect(a).toReturnTimes()',
    'expect(a).toReturnWith()',
    'expect(a).lastReturnedWith()',
    'expect(a).nthReturnedWith()',
    'expect(a).toThrow()',
    'expect(a).rejects.toThrow()',
  ].map(code => ({ code, options: ['short'] })),
  invalid: [
    {
      code: 'expect(a).toHaveBeenCalled()',
      errors: [
        {
          message:
            'Replace toHaveBeenCalled() with its short name of toBeCalled()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toBeCalled()',
    },
    {
      code: 'expect(a).toHaveBeenCalledTimes()',
      errors: [
        {
          message:
            'Replace toHaveBeenCalledTimes() with its short name of toBeCalledTimes()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toBeCalledTimes()',
    },
    {
      code: 'expect(a).toHaveBeenCalledWith()',
      errors: [
        {
          message:
            'Replace toHaveBeenCalledWith() with its short name of toBeCalledWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toBeCalledWith()',
    },
    {
      code: 'expect(a).toHaveBeenLastCalledWith()',
      errors: [
        {
          message:
            'Replace toHaveBeenLastCalledWith() with its short name of lastCalledWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).lastCalledWith()',
    },
    {
      code: 'expect(a).toHaveBeenNthCalledWith()',
      errors: [
        {
          message:
            'Replace toHaveBeenNthCalledWith() with its short name of nthCalledWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).nthCalledWith()',
    },
    {
      code: 'expect(a).toHaveReturned()',
      errors: [
        {
          message: 'Replace toHaveReturned() with its short name of toReturn()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toReturn()',
    },
    {
      code: 'expect(a).toHaveReturnedTimes()',
      errors: [
        {
          message:
            'Replace toHaveReturnedTimes() with its short name of toReturnTimes()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toReturnTimes()',
    },
    {
      code: 'expect(a).toHaveReturnedWith()',
      errors: [
        {
          message:
            'Replace toHaveReturnedWith() with its short name of toReturnWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toReturnWith()',
    },
    {
      code: 'expect(a).toHaveLastReturnedWith()',
      errors: [
        {
          message:
            'Replace toHaveLastReturnedWith() with its short name of lastReturnedWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).lastReturnedWith()',
    },
    {
      code: 'expect(a).toHaveNthReturnedWith()',
      errors: [
        {
          message:
            'Replace toHaveNthReturnedWith() with its short name of nthReturnedWith()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).nthReturnedWith()',
    },
    {
      code: 'expect(a).toThrowError()',
      errors: [
        {
          message: 'Replace toThrowError() with its short name of toThrow()',
          column: 11,
          line: 1,
        },
      ],
      output: 'expect(a).toThrow()',
    },
    {
      code: 'expect(a).resolves.toThrowError()',
      errors: [
        {
          message: 'Replace toThrowError() with its short name of toThrow()',
          column: 20,
          line: 1,
        },
      ],
      output: 'expect(a).resolves.toThrow()',
    },
    {
      code: 'expect(a).rejects.toThrowError()',
      errors: [
        {
          message: 'Replace toThrowError() with its short name of toThrow()',
          column: 19,
          line: 1,
        },
      ],
      output: 'expect(a).rejects.toThrow()',
    },
    {
      code: 'expect(a).not.toThrowError()',
      errors: [
        {
          message: 'Replace toThrowError() with its short name of toThrow()',
          column: 15,
          line: 1,
        },
      ],
      output: 'expect(a).not.toThrow()',
    },
  ].map(example => ((example.options = ['short']), example)),
});
