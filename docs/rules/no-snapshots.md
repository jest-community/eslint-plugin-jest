# Disallow snapshots (no-snapshots)

Jest’s snapshot feature allows you to assert that a value has not changed from a
stored value in a previous test. The matchers `toMatchSnapshot`,
`toMatchInlineSnapshot`, `toThrowErrorMatchingSnapshot` and
`toThrowErrorMatchingInlineSnapshot` will generate snapshots when used inside
test blocks.

## Rule Details

Using snapshots will often result in poorly documented, difficult to debug tests
that encourage writing a single test to cover a broad area of functionality when
seperate, more specific tests would be preferred. This rule aims to prevent the
use of jest snapshots.

Example of **incorrect** code for this rule:

```js
expect(doWork()).toMatchSnapshot();
```

```js
expect(doWork()).toMatchInlineSnapshot();
```

```js
expect(doWork()).toThrowErrorMatchingSnapshot();
```

```js
expect(doWork()).toThrowErrorMatchingInlineSnapshot();
```
