# Have control over `test` and `it` usages (consistent-test-it)

Jest allows you to choose how you want to define your tests, using the `it` or the `test` keywords, with multiple permutations for each:

* **it:** `it`, `xit`, `fit`, `it.only`, `it.skip`.
* **test:** `test`, `xtest`, `test.only`, `test.skip`.

This rule gives you control over the usage of these keywords in your codebase.

## Rule Details

This rule can be configured as follows

```js
{
    type: 'object',
    properties: {
        fn: {
            enum: ['it', 'test'],
        },
        withinDescribe: {
            enum: ['it', 'test'],
        },
    },
    additionalProperties: false,
}
```

#### fn

Decides whether to use `test` or `it`.

#### withinDescribe

Decides whether to use `test` or `it` within a describe scope.

```js
/*eslint consistent-test-it: ["error", {"fn": "test"}]*/

test('foo'); // valid
test.only('foo'); // valid

it('foo'); // invalid
it.only('foo'); // invalid
```

```js
/*eslint consistent-test-it: ["error", {"fn": "test"}]*/

test('foo'); // valid
test.only('foo'); // valid

it('foo'); // invalid
it.only('foo'); // invalid
```

```js
/*eslint consistent-test-it: ["error", {"fn": "it", "withinDesrcibe": "test"}]*/

it('foo'); // valid
describe('foo', () => {
  test('bar'); // valid
});

test('foo'); // invalid
describe('foo', () => {
  it('bar'); // invalid
});
```

### Default configuration

The default configuration forces top level test to use `test` and all tests nested within describe to use `it`.

```js
/*eslint consistent-test-it: ["error"]*/

test('foo'); // valid
describe('foo', () => {
  it('bar'); // valid
});

it('foo'); // invalid
describe('foo', () => {
  test('bar'); // invalid
});
```
