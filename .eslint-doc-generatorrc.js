/** @type {import('eslint-doc-generator/dist/lib/options').GenerateOptions} */
const config = {
  ignoreConfig: ['all'],
  ruleDocTitleFormat: 'desc-parens-name',
  ruleDocSectionInclude: ['Rule details'],
  ruleListColumns: [
    'name',
    'description',
    'configsError',
    'configsWarn',
    'configsOff',
    'fixable',
    'hasSuggestions',
    'deprecated',
  ].join(),
  splitBy: 'meta.docs.requiresTypeChecking',
  urlConfigs: `https://github.com/jest-community/eslint-plugin-jest/blob/main/README.md#shareable-configurations`,
};

module.exports = config;
