[![Build Status](https://travis-ci.org/jest-community/eslint-plugin-jest.svg?branch=master)](https://travis-ci.org/jest-community/eslint-plugin-jest)
[![Greenkeeper badge](https://badges.greenkeeper.io/jest-community/eslint-plugin-jest.svg)](https://greenkeeper.io/)

<div align="center">
  <a href="https://eslint.org/">
    <img width="150" height="150" src="https://eslint.org/img/logo.svg">
  </a>
  <a href="https://facebook.github.io/jest/">
    <img width="150" height="150" vspace="" hspace="25" src="https://cdn.worldvectorlogo.com/logos/jest.svg">
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

See
[ESLint documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files)
for more information about extending configuration files.

## Rules

| Rule                                                               | Description                                                       | Recommended                                                             | Fixable                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| [consistent-test-it](docs/rules/consistent-test-it.md)             | Enforce consistent test or it keyword                             |                                                                         | ![fixable](https://img.shields.io/badge/-fixable-green.svg) |
| [lowercase-name](docs/rules/lowercase-name.md)                     | Disallow capitalized test names                                   |                                                                         |                                                             |
| [no-disabled-tests](docs/rules/no-disabled-tests.md)               | Disallow disabled tests                                           | ![recommended](https://img.shields.io/badge/-recommended-lightgrey.svg) |                                                             |
| [no-focused-tests](docs/rules/no-focused-tests.md)                 | Disallow focused tests                                            | ![recommended](https://img.shields.io/badge/-recommended-lightgrey.svg) |                                                             |
| [no-hooks](docs/rules/no-hooks.md)                                 | Disallow setup and teardown hooks                                 |                                                                         |                                                             |
| [no-identical-title](docs/rules/no-identical-title.md)             | Disallow identical titles                                         | ![recommended](https://img.shields.io/badge/-recommended-lightgrey.svg) |                                                             |
| [no-jest-import](docs/rules/no-jest-import.md)                     | Disallow importing `jest`                                         | ![recommended](https://img.shields.io/badge/-recommended-lightgrey.svg) |                                                             |
| [no-large-snapshots](docs/rules/no-large-snapshots.md)             | Disallow large snapshots                                          |                                                                         |                                                             |
| [no-test-prefixes](docs/rules/no-test-prefixes.md)                 | Disallow using `f` & `x` prefixes to define focused/skipped tests |                                                                         | ![fixable](https://img.shields.io/badge/-fixable-green.svg) |
| [prefer-to-have-length](docs/rules/prefer-to-have-length.md)       | Suggest using `toHaveLength()`                                    | ![recommended](https://img.shields.io/badge/-recommended-lightgrey.svg) | ![fixable](https://img.shields.io/badge/-fixable-green.svg) |
| [prefer-to-be-null](docs/rules/prefer-to-be-null.md)               | Suggest using `toBeNull()`                                        |                                                                         | ![fixable](https://img.shields.io/badge/-fixable-green.svg) |
| [prefer-to-be-undefined](docs/rules/prefer-to-be-undefined.md)     | Suggest using `toBeUndefined()`                                   |                                                                         | ![fixable](https://img.shields.io/badge/-fixable-green.svg) |
| [prefer-expect-assertions](docs/rules/prefer-expect-assertions.md) | Suggest using `expect.assertions()` OR `expect.hasAssertions()`   |                                                                         |                                                             |
| [valid-describe](docs/rules/valid-describe.md)                     | Enforce valid `describe()` callback                               |                                                                         |                                                             |
| [valid-expect](docs/rules/valid-expect.md)                         | Enforce valid `expect()` usage                                    | ![recommended](https://img.shields.io/badge/-recommended-lightgrey.svg) |                                                             |
| [valid-expect-in-promise](docs/rules/valid-expect-in-promise.md)   | Enforce having return statement when testing with promises        |                                                                         |                                                             |

## Credit

* [eslint-plugin-mocha](https://github.com/lo1tuma/eslint-plugin-mocha)
* [eslint-plugin-jasmine](https://github.com/tlvince/eslint-plugin-jasmine)
