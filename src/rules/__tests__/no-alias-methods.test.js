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
          messageId: 'replaceAlias',
          data: { replace: 'toBeCalled', canonical: 'toHaveBeenCalled' },
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
          messageId: 'replaceAlias',
          data: {
            replace: 'toBeCalledTimes',
            canonical: 'toHaveBeenCalledTimes',
          },
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
          messageId: 'replaceAlias',
          data: {
            replace: 'toBeCalledWith',
            canonical: 'toHaveBeenCalledWith',
          },
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
          messageId: 'replaceAlias',
          data: {
            replace: 'lastCalledWith',
            canonical: 'toHaveBeenLastCalledWith',
          },
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
          messageId: 'replaceAlias',
          data: {
            replace: 'nthCalledWith',
            canonical: 'toHaveBeenNthCalledWith',
          },
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
          messageId: 'replaceAlias',
          data: { replace: 'toReturn', canonical: 'toHaveReturned' },
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
          messageId: 'replaceAlias',
          data: { replace: 'toReturnTimes', canonical: 'toHaveReturnedTimes' },
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
          messageId: 'replaceAlias',
          data: { replace: 'toReturnWith', canonical: 'toHaveReturnedWith' },
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
          messageId: 'replaceAlias',
          data: {
            replace: 'lastReturnedWith',
            canonical: 'toHaveLastReturnedWith',
          },
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
          messageId: 'replaceAlias',
          data: {
            replace: 'nthReturnedWith',
            canonical: 'toHaveNthReturnedWith',
          },
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
          messageId: 'replaceAlias',
          data: { replace: 'toThrowError', canonical: 'toThrow' },
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
          messageId: 'replaceAlias',
          data: { replace: 'toThrowError', canonical: 'toThrow' },
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
          messageId: 'replaceAlias',
          data: { replace: 'toThrowError', canonical: 'toThrow' },
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
          messageId: 'replaceAlias',
          data: { replace: 'toThrowError', canonical: 'toThrow' },
          column: 15,
          line: 1,
        },
      ],
      output: 'expect(a).not.toThrow()',
    },
  ],
});
