# jest/no-conditional-in-test

📝 Disallow conditional logic in tests.

<!-- end auto-generated rule header -->

Conditional logic in tests is usually an indication that a test is attempting to
cover too much, and not testing the logic it intends to. Each branch of code
executing within a conditional statement will usually be better served by a test
devoted to it.

## Rule details

This rule reports on any use of a conditional statement such as `if`, `switch`,
and ternary expressions.

Examples of **incorrect** code for this rule:

```js
it('foo', () => {
  if (true) {
    doTheThing();
  }
});

it('bar', () => {
  switch (mode) {
    case 'none':
      generateNone();
    case 'single':
      generateOne();
    case 'multiple':
      generateMany();
  }

  expect(fixtures.length).toBeGreaterThan(-1);
});

it('qux', async () => {
  const promiseValue = () => {
    return something instanceof Promise
      ? something
      : Promise.resolve(something);
  };

  await expect(promiseValue()).resolves.toBe(1);
});
```

Examples of **correct** code for this rule:

```js
describe('my tests', () => {
  if (true) {
    it('foo', () => {
      doTheThing();
    });
  }
});

beforeEach(() => {
  switch (mode) {
    case 'none':
      generateNone();
    case 'single':
      generateOne();
    case 'multiple':
      generateMany();
  }
});

it('bar', () => {
  expect(fixtures.length).toBeGreaterThan(-1);
});

const promiseValue = something => {
  return something instanceof Promise ? something : Promise.resolve(something);
};

it('qux', async () => {
  await expect(promiseValue()).resolves.toBe(1);
});
```

## Options

```json
{
  "jest/no-conditional-in-test": [
    "error",
    {
      "allowOptionalChaining": true
    }
  ]
}
```

### `allowOptionalChaining`

Default: `true`

When set to `false`, optional chaining (`?.`) inside test bodies will be
reported as a conditional.

Examples of **incorrect** code when `allowOptionalChaining` is `false`:

```js
it('foo', () => {
  const value = obj?.bar;
});

it('bar', () => {
  obj?.foo();
});
```

Examples of **correct** code when `allowOptionalChaining` is `false`:

```js
it('foo', () => {
  const value = obj!.bar;
});
```
