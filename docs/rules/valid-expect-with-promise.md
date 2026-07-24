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

## Options

```json
{
  "jest/valid-expect-with-promise": [
    "error",
    {
      "checkThenables": false
    }
  ]
}
```

### `checkThenables`

Default: `false`

A
["Thenable"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables)
value is an object which has a `then` method, such as a `Promise`. Other
Thenables include TypeScript's built-in `PromiseLike` interface and any custom
object that happens to have a `.then()`.

The `checkThenables` option triggers `valid-expect-with-promise` to also
consider all values that satisfy the Thenable shape (a `.then()` method that
takes two callback parameters), not just Promises. This can be useful if your
code works with older `Promise` polyfills instead of the native `Promise` class,
or in environments where the global `Promise` is not declared by TypeScript's
default libraries (such as with `noLib`).

Examples of **incorrect** code when `checkThenables` is `true`:

```ts
declare function createPromiseLike(): PromiseLike<string>;

expect(createPromiseLike()).toBe('hello sunshine');

interface MyThenable {
  then(onFulfilled: () => void, onRejected: () => void): MyThenable;
}

declare function createMyThenable(): MyThenable;

expect(createMyThenable()).toBe('hello sunshine');
```

Examples of **correct** code when `checkThenables` is `true`:

```ts
declare function createPromiseLike(): PromiseLike<string>;

await expect(createPromiseLike()).resolves.toBe('hello sunshine');

interface MyThenable {
  then(onFulfilled: () => void, onRejected: () => void): MyThenable;
}

declare function createMyThenable(): MyThenable;

await expect(createMyThenable()).resolves.toBe('hello sunshine');
```
