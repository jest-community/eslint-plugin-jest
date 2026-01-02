'use strict';

const { format } = require('prettier');
const { prettier: prettierRC } = require('./package.json');

/** @type {import('eslint-doc-generator').GenerateOptions} */
const config = {
  ignoreConfig: [
    'all',
    'flat/all',
    'flat/recommended',
    'flat/style',
    'flat/snapshots',
  ],
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
  ],
  ruleListSplit: 'meta.docs.requiresTypeChecking',
  urlConfigs: `https://github.com/jest-community/eslint-plugin-jest/blob/main/README.md#shareable-configurations`,
  postprocess: doc =>
    format(doc, {
      .../** @type {import('prettier').ResolveConfigOptions} */ (prettierRC),
      parser: 'markdown',
    }),
};

module.exports = config;
