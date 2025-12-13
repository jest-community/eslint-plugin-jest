import rule from '../prefer-to-have-been-called';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2020,
  },
});

ruleTester.run('prefer-to-have-been-called', rule, {
  valid: [
    'expect(method.mock.calls).toHaveLength;',
    'expect(method.mock.calls).toHaveLength(0);',
    'expect(method).toHaveBeenCalledTimes(1)',
    'expect(method).not.toHaveBeenCalledTimes(x)',
    'expect(method).not.toHaveBeenCalledTimes(1)',
    'expect(method).not.toHaveBeenCalledTimes(...x)',
    'expect(a);',
    'expect(method).not.resolves.toHaveBeenCalledTimes(0);',
  ],

  invalid: [
    {
      code: 'expect(method).toBeCalledTimes(0);',
      output: 'expect(method).not.toHaveBeenCalled();',
      errors: [{ messageId: 'preferMatcher', column: 16, line: 1 }],
    },
    {
      code: 'expect(method).not.toBeCalledTimes(0);',
      output: 'expect(method).toHaveBeenCalled();',
      errors: [{ messageId: 'preferMatcher', column: 20, line: 1 }],
    },
    {
      code: 'expect(method).toHaveBeenCalledTimes(0);',
      output: 'expect(method).not.toHaveBeenCalled();',
      errors: [{ messageId: 'preferMatcher', column: 16, line: 1 }],
    },
    {
      code: 'expect(method).not.toHaveBeenCalledTimes(0);',
      output: 'expect(method).toHaveBeenCalled();',
      errors: [{ messageId: 'preferMatcher', column: 20, line: 1 }],
    },
    {
      code: 'expect(method).not.toHaveBeenCalledTimes(0, 1, 2);',
      output: 'expect(method).toHaveBeenCalled();',
      errors: [{ messageId: 'preferMatcher', column: 20, line: 1 }],
    },

    {
      code: 'expect(method).resolves.toHaveBeenCalledTimes(0);',
      output: 'expect(method).resolves.not.toHaveBeenCalled();',
      errors: [{ messageId: 'preferMatcher', column: 25, line: 1 }],
    },
    {
      code: 'expect(method).rejects.not.toHaveBeenCalledTimes(0);',
      output: 'expect(method).rejects.toHaveBeenCalled();',
      errors: [{ messageId: 'preferMatcher', column: 28, line: 1 }],
    },

    {
      code: 'expect(method).toBeCalledTimes(0 as number);',
      output: 'expect(method).not.toHaveBeenCalled();',
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'preferMatcher', column: 16, line: 1 }],
    },
  ],
});
