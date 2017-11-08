// @flow

/* eslint-disable sort-keys */

'use strict';

import { RuleTester } from 'eslint';
const { rules } = require('../../');

const ruleTester = new RuleTester();

ruleTester.run('prefer_to_have_length', rules['prefer-to-have-length'], {
  valid: ['expect(files).toHaveLength(1);', "expect(files.name).toBe('file');"],

  invalid: [
    {
      code: 'expect(files.length).toBe(1);',
      errors: [
        {
          message: 'Use toHaveLength() instead',
          column: 22,
          line: 1,
        },
      ],
      output: 'expect(files).toHaveLength(1);',
    },
  ],
});
