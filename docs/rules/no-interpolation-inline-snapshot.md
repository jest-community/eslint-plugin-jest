# No string interpolation inside inline snapshots (no-interpolation-inline-snapshot)

Prevents the use of string interpolations within `toMatchInlineSnapshot`.

## Rule Details

Interpolation prevents snapshots from being updated. Instead, properties should
be overloaded with a matcher by passing the optional `propertyMatchers` argument
to `toMatchInlineSnapshot`.

Examples of **incorrect** code for this rule:

```js
expect(something).toMatchInlineSnapshot(
  `Object {
    property: ${interpolated}
  }`,
);

expect(something).toMatchInlineSnapshot(
  { other: expect.any(Number) },
  `Object {
    other: Any<Number>,
    property: ${interpolated}
  }`,
);
```

Examples of **correct** code for this rule:

```js
expect(something).toMatchInlineSnapshot();

expect(something).toMatchInlineSnapshot(
  `Object {
    property: 1
  }`,
);

expect(something).toMatchInlineSnapshot(
  { property: expect.any(Date) },
  `Object {
    property: Any<Date>
  }`,
);
```

\*Note that this rule will not trigger if the helper function is never used even
thought the `expect` will not execute. Rely on a rule like no-unused-vars for
this case.

## When Not To Use It

Don't use this rule on non-jest test files.
