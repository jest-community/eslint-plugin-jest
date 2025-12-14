# Suggest using `toHaveBeenCalledTimes()` (`prefer-to-have-been-called-times`)

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

In order to have a better failure message, `toHaveBeenCalledTimes` should be
used instead of directly checking the length of `mock.calls`.

## Rule details

This rule triggers a warning if `toHaveLength` is used to assert the number of
times a mock is called.

> [!NOTE]
>
> This rule should ideally be paired with
> [`prefer-to-have-length`](./prefer-to-have-length.md)

The following patterns are considered warnings:

```js
expect(someFunction.mock.calls).toHaveLength(1);
expect(someFunction.mock.calls).toHaveLength(0);

expect(someFunction.mock.calls).not.toHaveLength(1);
```

The following patterns are not warnings:

```js
expect(someFunction).toHaveBeenCalledTimes(1);
expect(someFunction).toHaveBeenCalledTimes(0);

expect(someFunction).not.toHaveBeenCalledTimes(0);

expect(uncalledFunction).not.toBeCalled();

expect(method.mock.calls[0][0]).toStrictEqual(value);
```
