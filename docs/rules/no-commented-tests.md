# Disallow commented tests (no-commented-tests)

This rule raises a warning about commented tests.

## Rule Details

<!-- The following patterns are considered warnings:

```js
describe.skip('foo', () => {});
it.skip('foo', () => {});
test.skip('foo', () => {});

describe['skip']('bar', () => {});
it['skip']('bar', () => {});
test['skip']('bar', () => {});

xdescribe('foo', () => {});
xit('foo', () => {});
xtest('foo', () => {});

it('bar');
test('bar');

it('foo', () => {
  pending();
});
```

These patterns would not be considered warnings:

```js
describe('foo', () => {});
it('foo', () => {});
test('foo', () => {});

describe.only('bar', () => {});
it.only('bar', () => {});
test.only('bar', () => {});
```

### Limitations

The plugin looks at the literal function names within test code, so will not
catch more complex examples of disabled tests, such as:

```js
const testSkip = test.skip;
testSkip('skipped test', () => {});

const myTest = test;
myTest('does not have function body');
``` -->
