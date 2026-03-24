# jest/no-unnecessary-assertion

📝 Disallow unnecessary assertions based on types.

💭 This rule requires
[type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

When using TypeScript, runtime assertions based on types can often be omitted
provided that the types are accurate.

## Rule details

This rule warns when you do an assertion about being `null`, `undefined`, or
`NaN` on something that cannot be those types, as that indicates either the
assertion can be removed or the types need to be adjusted.

The following patterns are considered warnings:

```ts
expect('hello world'.match('sunshine') ?? []).toBeNull();

expect(User.findOrThrow(1)).toBeDefined();

expect(map.getOrInsert('key', 'default')).not.toBeUndefined();

expect(user.name).not.toBeNaN();
```

The following patterns are not considered warnings:

```ts
expect('hello world'.match('sunshine')).toBeNull();

expect(User.findOrNull(1)).toBeDefined();

expect(map.get('key')).not.toBeUndefined();

expect(user.age).not.toBeNaN();
```
