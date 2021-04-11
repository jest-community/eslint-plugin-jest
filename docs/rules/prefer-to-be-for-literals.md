# Suggest using `tooBe()` for primitive literals (`prefer-to-be-for-literals`)

When asserting against primitive literals such as numbers and strings, the
equality matchers all operate the same, but read slightly differently in code.

This rule recommends using the `toBe` matcher in these situations, as it forms
the most grammatically natural sentence.

## Rule details

This rule triggers a warning if `toEqual()` or `toStrictEqual()` are used to
assert a primitive literal value such as a string or a number.

The following patterns are considered warnings:

```js
expect(value).not.toEqual(5);
expect(getMessage()).toStrictEqual('hello world');
expect(loadMessage()).resolves.toEqual('hello world');
```

The following pattern is not warning:

```js
expect(value).not.toBe(5);
expect(getMessage()).toBe('hello world');
expect(loadMessage()).resolves.toBe('hello world');

expect(catchError()).toStrictEqual({ message: 'oh noes!' });
```
