# Disallow unnecessary async function wrapper for expected promises (`no-async-wrapper-for-expected-promise`)

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

`Jest` can handle fulfilled/rejected promisified function call normally but
occassionally, engineers wrap said function in another `async` function that is
excessively verbose and make the tests harder to read.

## Rule details

This rule triggers a warning if a single `await` function call is wrapped by an
unnecessary `async` function.

Examples of **incorrect** code for this rule

```js
it('wrong1', async () => {
  await expect(async () => {
    await doSomethingAsync();
  }).rejects.toThrow();
});

it('wrong2', async () => {
  await expect(async function () {
    await doSomethingAsync();
  }).rejects.toThrow();
});
```

Examples of **correct** code for this rule

```js
it('right1', async () => {
  await expect(doSomethingAsync()).rejects.toThrow();
});
```
