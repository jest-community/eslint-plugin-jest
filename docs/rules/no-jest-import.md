# Disallow importing Jest (`no-jest-import`)

The `jest` object is automatically in scope within every test file. The methods
in the `jest` object help create mocks and let you control Jest's overall
behavior. It is therefore usually unnecessary to import in `jest`, as Jest
doesn't export anything in the first place.

### Rule details

This rule reports on any importing of Jest.

To name a few: `var jest = require('jest');` `const jest = require('jest');`
`import jest from 'jest';` `import {jest as test} from 'jest';`

Examples of correct code include running Jest programatically in non-CLI
environments (note that this is [not officially supported](https://github.com/facebook/jest/issues/5048)):

```js
const jest = require('jest')
jest.runCLI(...)
```

## Further Reading

- [The Jest Object](https://facebook.github.io/jest/docs/en/jest-object.html)
