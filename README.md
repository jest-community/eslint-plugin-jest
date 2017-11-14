[![Build Status](https://travis-ci.org/jest-community/eslint-plugin-jest.svg?branch=master)](https://travis-ci.org/jest-community/eslint-plugin-jest) [![Greenkeeper badge](https://badges.greenkeeper.io/jest-community/eslint-plugin-jest.svg)](https://greenkeeper.io/)

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

## Supported Rules

* [no-disabled-tests](/docs/rules/no-disabled-tests.md) - disallow disabled
  tests.
* [no-focused-tests](/docs/rules/no-focused-tests.md) - disallow focused tests.
* [no-identical-title](/docs/rules/no-identical-title.md) - disallow identical
  titles.
* [prefer-to-have-length](/docs/rules/prefer-to-have-length.md) - suggest using
  `toHaveLength()`.
* [valid-expect](/docs/rules/valid-expect.md) - ensure expect is called
  correctly.

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

See [ESLint
documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files)
for more information about extending configuration files.

The rules enabled in this configuration are:

* [jest/no-disabled-tests](/docs/rules/no-disabled-tests.md)
* [jest/no-focused-tests](/docs/rules/no-focused-tests.md)
* [jest/no-identical-title](/docs/rules/no-identical-title.md)
* [jest/prefer-to-have-length](/docs/rules/prefer-to-have-length.md)
* [jest/valid-expect](/docs/rules/valid-expect.md)

## Credit

* [eslint-plugin-mocha](https://github.com/lo1tuma/eslint-plugin-mocha)
* [eslint-plugin-jasmine](https://github.com/tlvince/eslint-plugin-jasmine)
