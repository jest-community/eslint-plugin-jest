# jest/no-error-equal

📝 Disallow using equality matchers on error types.

💭 This rule requires
[type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

When comparing errors, `toEqual` and `toStrictEqual` will only compare the
`message` properties, meaning tests can pass even if the errors are of different
types.

Instead, it is better to use `toThrow` which does check the error type along
with its message.

## Rule details

This rule warns when `toEqual` and `toStrictEqual` is used with an `Error` type.

The following patterns are considered warnings:

```ts
expect(new AggregateError([], expect.any(String))).toEqual(
  new Error(expect.any(String)),
);

expect(new Error('hello world')).toStrictEqual('hello sunshine');
```

The following patterns are not considered warnings:

```ts
expect(() => throw new AggregateError([], expect.any(String))).toThrow(new Error(expect.any(String)));

expect(() => throw new Error('hello world')).toThrow('hello sunshine');
```
