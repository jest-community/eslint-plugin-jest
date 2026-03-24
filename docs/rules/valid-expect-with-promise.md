# jest/valid-expect-with-promise

📝 Require that `resolve` and `reject` modifiers are present (and only) for
promise-like types.

💭 This rule requires
[type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

When working with promises, you must remember to use `resolves` and `rejects` to
assert on the value returned (or thrown) by the promise, rather than the promise
itself.

Inversely, while Jest does not prevent you from using `resolves` and `rejects`
on non-promise values, it is not necessary.

When TypeScript is in use, it is possible to determine when `resolves` and
`rejects` should and should not be needed.

## Rule details

This rule warns when:

- an `expect` is given a promise-like value but without `resolves` or `rejects`
- an `expect` is not given a promise-like value, but is used with `resolves` or
  `rejects`

The following patterns are considered warnings:

```ts
expect('hello world').resolves.toBe('hello sunshine');

expect(new Promise(r => r(0))).toThrow('oh noes!');
```

The following patterns are not considered warnings:

```ts
expect('hello world').toBe('hello sunshine');

expect(new Promise(r => r(0))).rejects.toThrow('oh noes!');
```
