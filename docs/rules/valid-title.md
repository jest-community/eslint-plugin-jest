# describe/test titles should be valid (valid-title)

Checks that the title of Jest blocks are valid by ensuring that titles are:

- not empty,
- not prefixed with their block name,
- have no leading or trailing spaces

## Rule Details

**emptyTitle**

An empty title is not informative, and serves little purpose.

Examples of **incorrect** code for this rule:

```js
describe('', () => {});
describe('foo', () => {
  it('', () => {});
});
it('', () => {});
test('', () => {});
xdescribe('', () => {});
xit('', () => {});
xtest('', () => {});
```

Examples of **correct** code for this rule:

```js
describe('foo', () => {});
describe('foo', () => {
  it('bar', () => {});
});
test('foo', () => {});
it('foo', () => {});
xdescribe('foo', () => {});
xit('foo', () => {});
xtest('foo', () => {});
```

**duplicatePrefix**

A describe/ test block should not start with duplicatePrefix

Examples of **incorrect** code for this rule

```js
test('test foo', () => {});
it('it foo', () => {});

describe('foo', () => {
  test('test bar', () => {});
});

describe('describe foo', () => {
  test('bar', () => {});
});
```

Examples of **correct** code for this rule

```js
test('foo', () => {});
it('foo', () => {});

describe('foo', () => {
  test('bar', () => {});
});
```

**accidentalSpace**

A describe/ test block should not contain accidentalSpace

Examples of **incorrect** code for this rule

```js
test(' foo', () => {});
it(' foo', () => {});

describe('foo', () => {
  test(' bar', () => {});
});

describe(' foo', () => {
  test('bar', () => {});
});

describe('foo  ', () => {
  test('bar', () => {});
});
```

Examples of **correct** code for this rule

```js
test('foo', () => {});
it('foo', () => {});

describe('foo', () => {
  test('bar', () => {});
});
```
