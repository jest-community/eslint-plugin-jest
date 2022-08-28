# Suggest using the built-in equality matchers (`prefer-equality-matcher`)

<!-- prettier-ignore -->
💼 This rule is enabled in the following [configs](https://github.com/jest-community/eslint-plugin-jest#shareable-configurations): `all`.

<!-- prettier-ignore -->
💡 This rule is manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

Jest has built-in matchers for expecting equality, which allow for more readable
tests and error messages if an expectation fails.

## Rule Details

This rule checks for _strict_ equality checks (`===` & `!==`) in tests that
could be replaced with one of the following built-in equality matchers:

- `toBe`
- `toEqual`
- `toStrictEqual`

Examples of **incorrect** code for this rule:

```js
expect(x === 5).toBe(true);
expect(name === 'Carl').not.toEqual(true);
expect(myObj !== thatObj).toStrictEqual(true);
```

Examples of **correct** code for this rule:

```js
expect(x).toBe(5);
expect(name).not.toEqual('Carl');
expect(myObj).toStrictEqual(thatObj);
```
