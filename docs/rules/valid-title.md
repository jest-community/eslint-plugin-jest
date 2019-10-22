# Disallow duplicate setup and teardown hooks (no-duplicate-hooks)

A describe/ test block should not contain accidentalSpace or duplicatePrefix.

## Rule Details

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
```

Examples of **correct** code for this rule

```js
test('foo', () => {});
it('foo', () => {});

describe('foo', () => {
  test('bar', () => {});
});
```
