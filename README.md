[![Build Status](https://travis-ci.org/jest-community/eslint-plugin-jest.svg?branch=master)](https://travis-ci.org/jest-community/eslint-plugin-jest)
[![Greenkeeper badge](https://badges.greenkeeper.io/jest-community/eslint-plugin-jest.svg)](https://greenkeeper.io/)

<div align="center">
  <a href="https://eslint.org/">
    <img width="150" height="150" src="https://eslint.org/img/logo.svg">
  </a>
  <a href="https://facebook.github.io/jest/">
    <img width="150" height="150" vspace="" hspace="25" src="https://jestjs.io/img/jest.png">
  </a>
  <h1>eslint-plugin-jest</h1>
  <p>ESLint plugin for Jest</p>
</div>

## Installation

```
$ yarn add --dev eslint eslint-plugin-jest
```

**Note:** If you installed ESLint globally then you must also install
`eslint-plugin-jest` globally.

## Usage

Add `jest` to the plugins section of your `.eslintrc` configuration file. You
can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["jest"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error"
  }
}
```

You can also whitelist the environment variables provided by Jest by doing:

```json
{
  "env": {
    "jest/globals": true
  }
}
```

## Shareable configurations

### Recommended

This plugin exports a recommended configuration that enforces good testing
practices.

To enable this configuration use the `extends` property in your `.eslintrc`
config file:

```json
{
  "extends": ["plugin:jest/recommended"]
}
```

### Style

This plugin also exports a configuration named `style`, which adds some
stylistic rules, such as `prefer-to-be-null`, which enforces usage of `toBeNull`
over `toBe(null)`. All rules included are:

- `prefer-to-be-null`
- `prefer-to-be-undefined`
- `prefer-to-contain`
- `prefer-to-have-length`

See
[ESLint documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files)
for more information about extending configuration files.

## Rules

| Rule                         | Description                                                       | Recommended      | Fixable             |
| ---------------------------- | ----------------------------------------------------------------- | ---------------- | ------------------- |
| [consistent-test-it][]       | Enforce consistent test or it keyword                             |                  | ![fixable-green][]  |
| [expect-expect][]            | Enforce assertion to be made in a test body                       |                  |                     |
| [lowercase-name][]           | Disallow capitalized test names                                   |                  | ![fixable-green][]  |
| [no-alias-methods][]         | Disallow alias methods                                            | ![recommended][] | ![fixable-green][]  |
| [no-disabled-tests][]        | Disallow disabled tests                                           | ![recommended][] |                     |
| [no-empty-title][]           | Disallow empty titles                                             |                  |                     |
| [no-focused-tests][]         | Disallow focused tests                                            | ![recommended][] |                     |
| [no-hooks][]                 | Disallow setup and teardown hooks                                 |                  |                     |
| [no-identical-title][]       | Disallow identical titles                                         | ![recommended][] |                     |
| [no-jasmine-globals][]       | Disallow Jasmine globals                                          | ![recommended][] | ![fixable-yellow][] |
| [no-jest-import][]           | Disallow importing `jest`                                         | ![recommended][] |                     |
| [no-mocks-import][]          | Disallow manually importing from `__mocks__`                      |                  |                     |
| [no-large-snapshots][]       | Disallow large snapshots                                          |                  |                     |
| [no-test-callback][]         | Using a callback in asynchronous tests                            |                  | ![fixable-green][]  |
| [no-test-prefixes][]         | Disallow using `f` & `x` prefixes to define focused/skipped tests | ![recommended][] | ![fixable-green][]  |
| [no-test-return-statement][] | Disallow explicitly returning from tests                          |                  |                     |
| [no-truthy-falsy][]          | Disallow using `toBeTruthy()` & `toBeFalsy()`                     |                  |                     |
| [prefer-expect-assertions][] | Suggest using `expect.assertions()` OR `expect.hasAssertions()`   |                  |                     |
| [prefer-spy-on][]            | Suggest using `jest.spyOn()`                                      |                  | ![fixable-green][]  |
| [prefer-strict-equal][]      | Suggest using `toStrictEqual()`                                   |                  | ![fixable-green][]  |
| [prefer-to-be-null][]        | Suggest using `toBeNull()`                                        |                  | ![fixable-green][]  |
| [prefer-to-be-undefined][]   | Suggest using `toBeUndefined()`                                   |                  | ![fixable-green][]  |
| [prefer-to-contain][]        | Suggest using `toContain()`                                       |                  | ![fixable-green][]  |
| [prefer-to-have-length][]    | Suggest using `toHaveLength()`                                    |                  | ![fixable-green][]  |
| [prefer-inline-snapshots][]  | Suggest using `toMatchInlineSnapshot()`                           |                  | ![fixable-green][]  |
| [require-tothrow-message][]  | Require that `toThrow()` and `toThrowError` includes a message    |                  |                     |
| [valid-describe][]           | Enforce valid `describe()` callback                               | ![recommended][] |                     |
| [valid-expect-in-promise][]  | Enforce having return statement when testing with promises        | ![recommended][] |                     |
| [valid-expect][]             | Enforce valid `expect()` usage                                    | ![recommended][] |                     |
| [prefer-todo][]              | Suggest using `test.todo()`                                       |                  | ![fixable-green][]  |
| [prefer-called-with][]       | Suggest using `toBeCalledWith()` OR `toHaveBeenCalledWith()`      |                  |                     |

## Credit

- [eslint-plugin-mocha](https://github.com/lo1tuma/eslint-plugin-mocha)
- [eslint-plugin-jasmine](https://github.com/tlvince/eslint-plugin-jasmine)

[consistent-test-it]: docs/rules/consistent-test-it.md
[expect-expect]: docs/rules/expect-expect.md
[lowercase-name]: docs/rules/lowercase-name.md
[no-alias-methods]: docs/rules/no-alias-methods.md
[no-disabled-tests]: docs/rules/no-disabled-tests.md
[no-empty-title]: docs/rules/no-empty-title.md
[no-focused-tests]: docs/rules/no-focused-tests.md
[no-hooks]: docs/rules/no-hooks.md
[no-identical-title]: docs/rules/no-identical-title.md
[no-jasmine-globals]: docs/rules/no-jasmine-globals.md
[no-jest-import]: docs/rules/no-jest-import.md
[no-mocks-import]: docs/rules/no-mocks-import.md
[no-large-snapshots]: docs/rules/no-large-snapshots.md
[no-test-callback]: docs/rules/no-test-callback.md
[no-test-prefixes]: docs/rules/no-test-prefixes.md
[no-test-return-statement]: docs/rules/no-test-return-statement.md
[no-truthy-falsy]: docs/rules/no-truthy-falsy.md
[prefer-called-with]: docs/rules/prefer-called-with.md
[prefer-expect-assertions]: docs/rules/prefer-expect-assertions.md
[prefer-spy-on]: docs/rules/prefer-spy-on.md
[prefer-strict-equal]: docs/rules/prefer-strict-equal.md
[prefer-to-be-null]: docs/rules/prefer-to-be-null.md
[prefer-to-be-undefined]: docs/rules/prefer-to-be-undefined.md
[prefer-to-contain]: docs/rules/prefer-to-contain.md
[prefer-to-have-length]: docs/rules/prefer-to-have-length.md
[prefer-inline-snapshots]: docs/rules/prefer-inline-snapshots.md
[require-tothrow-message]: docs/rules/require-tothrow-message.md
[valid-describe]: docs/rules/valid-describe.md
[valid-expect-in-promise]: docs/rules/valid-expect-in-promise.md
[valid-expect]: docs/rules/valid-expect.md
[prefer-todo]: docs/rules/prefer-todo.md
[fixable-green]: https://img.shields.io/badge/-fixable-green.svg
[fixable-yellow]: https://img.shields.io/badge/-fixable-yellow.svg
[recommended]: https://img.shields.io/badge/-recommended-lightgrey.svg
