'use strict';

const { RuleTester } = require('eslint');
const rule = require('../prefer-called-with');

const ruleTester = new RuleTester();

ruleTester.run('prefer-called-with', rule, {
  valid: [
    'expect(fn).toBeCalledWith();',
    'expect(fn).toHaveBeenCalledWith();',
    'expect(fn).toBeCalledWith(expect.anything());',
    'expect(fn).toHaveBeenCalledWith(expect.anything());',
    'expect(fn).not.toBeCalled();',
    'expect(fn).not.toHaveBeenCalled();',
    'expect(fn).not.toBeCalledWith();',
    'expect(fn).not.toHaveBeenCalledWith();',
    'expect(fn).toBeCalledTimes(0);',
    'expect(fn).toHaveBeenCalledTimes(0);',
  ],

  invalid: [
    {
      code: 'expect(fn).toBeCalled();',
      errors: [
        {
          messageId: 'preferCalledWith',
          data: { name: 'toBeCalled' },
          column: 12,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(fn).toHaveBeenCalled();',
      errors: [
        {
          messageId: 'preferCalledWith',
          data: { name: 'toHaveBeenCalled' },
          column: 12,
          line: 1,
        },
      ],
    },
  ],
});
