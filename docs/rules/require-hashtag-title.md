# Enforce the usage of hashtag on the test cases title (`require-hashtag-title`)

Checks that the title of `it()` blocks are valid by ensuring that titles have at
least one hashtag to mark it. This is a best practice in JS testing as mentioned
[here](https://github.com/goldbergyoni/javascript-testing-best-practices#-%EF%B8%8F-111-tag-your-tests).

## Rule Details

Giving your test cases a tag make your life easier when your project grew bigger
and/or you have many different types of tests. When your tests have tags, you
can easily choose which kind or context of tests you want to run simply
[telling Jest what is the pattern](https://jestjs.io/docs/en/cli.html#testnamepattern-regex).
But also it is hard sometimes to remember to tag your test cases, and that is
why this rule was made for.

Examples of **incorrect** code for this rule:

```js
it('no tag at all', function() {});
```

Examples of **correct** code for this rule:

```js
it('#test', function() {});

it('#test in the beginning', function() {});

it('in the end #test', function() {});

it('in the #test middle', function() {});

it('many #different #tags', function() {});
```

## Options

```ts
interface {
  allowedHashtags?: string[];
}
```

#### `allowedHashtags`

Default: `[]`

A string array of words that are the only allowed to be used in test titles.
Matching is not case-sensitive, and looks for complete words. If an empty array
(default value) is provided, it will accept any word as a valid tag:

Examples of **incorrect** code using `allowedHashtags`:

```js
// with allowedHashtags: ['unit', 'sanity']
it("another #different tag", function () {}),
```

Examples of **correct** code when using `allowedHashtags`:

```js
// with allowedHashtags: ['unit', 'sanity', 'happy_path']
it("should return the correct value #unit #happy_path", function () {}),
```
