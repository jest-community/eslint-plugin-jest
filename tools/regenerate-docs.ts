#!/usr/bin/env ts-node-transpile-only

import * as fs from 'fs';
import * as path from 'path';
import { TSESLint } from '@typescript-eslint/utils';
import prettier, { Options } from 'prettier';
import { prettier as prettierRC } from '../package.json';
import plugin from '../src/index';
import { getRuleNoticeLines } from './rule-notices';

// Marker so that rule doc header (title/notices) can be automatically updated.
export const END_RULE_HEADER_MARKER = '<!-- end rule header -->';

const pathTo = {
  readme: path.resolve(__dirname, '../README.md'),
  rules: path.resolve(__dirname, '../src/rules'),
  docs: path.resolve(__dirname, '../docs'),
};

const format = (str: string): string =>
  prettier.format(str, { ...(prettierRC as Options), parser: 'markdown' });

type FixType = 'fixable' | 'suggest';

interface RuleDetails {
  name: string;
  description: string;
  fixable: FixType | false;
  requiresTypeChecking: boolean;
  deprecated: boolean;
  schema: any;
}

type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
  meta: Required<Pick<TSESLint.RuleMetaData<string>, 'docs'>>;
};

const staticElements = {
  listHeaderRow: ['Rule', 'Description', 'Configurations', 'Fixable'],
  listSpacerRow: Array(5).fill('-'),
};

const getConfigurationColumnValueForRule = (rule: RuleDetails): string => {
  if (`jest/${rule.name}` in plugin.configs.recommended.rules) {
    return '![recommended][]';
  }

  if (`jest/${rule.name}` in plugin.configs.style.rules) {
    return '![style][]';
  }

  if (rule.deprecated) {
    return '![deprecated][]';
  }

  return '';
};

const buildRuleRow = (rule: RuleDetails): string[] => [
  `[${rule.name}](docs/rules/${rule.name}.md)`,
  rule.description,
  getConfigurationColumnValueForRule(rule),
  rule.fixable ? `![${rule.fixable}][]` : '',
];

const generateRulesListMarkdown = (details: RuleDetails[]): string =>
  [
    staticElements.listHeaderRow,
    staticElements.listSpacerRow,
    ...details
      .sort(({ name: a }, { name: b }) => a.localeCompare(b))
      .map(buildRuleRow),
  ]
    .map(column => [...column, ' '].join('|'))
    .join('\n');

const updateRulesList = (
  listName: 'base' | 'type',
  details: RuleDetails[],
  markdown: string,
): string => {
  const listBeginMarker = `<!-- begin ${listName} rules list -->`;
  const listEndMarker = `<!-- end ${listName} rules list -->`;

  const listStartIndex = markdown.indexOf(listBeginMarker);
  const listEndIndex = markdown.indexOf(listEndMarker);

  if (listStartIndex === -1 || listEndIndex === -1) {
    throw new Error(`cannot find start or end of rules list`);
  }

  return [
    markdown.substring(0, listStartIndex - 1),
    listBeginMarker,
    '',
    generateRulesListMarkdown(details),
    '',
    markdown.substring(listEndIndex),
  ].join('\n');
};

/**
 * Generate a rule doc header for a particular rule.
 * @param description - rule description
 * @param name - rule name
 * @returns {string[]} - lines for new header including marker
 */
const generateRuleHeaderLines = (
  description: string,
  name: string,
): string[] => [
  `# ${description} (\`${name}\`)`,
  ...getRuleNoticeLines(name),
  END_RULE_HEADER_MARKER,
];

/**
 * Replace the header of a doc up to and including the specified marker.
 * Insert at beginning if header doesn't exist.
 * @param lines - lines of doc
 * @param newHeaderLines - lines of new header including marker
 * @param marker - marker to indicate end of header
 */
const replaceOrCreateHeader = (
  lines: string[],
  newHeaderLines: string[],
  marker: string,
) => {
  const markerLineIndex = lines.findIndex(line => line === marker);

  // Replace header section (or create at top if missing).
  lines.splice(0, markerLineIndex + 1, ...newHeaderLines);
};

/**
 * Ensure a rule doc contains (or doesn't contain) some particular content.
 * Upon failure, output the failure and exit with failure.
 * @param ruleName - which rule we are checking
 * @param contents - the rule doc's contents
 * @param content - the content we are checking for
 * @param expected - whether the content should be present or not present
 */
const expectContent = (
  ruleName: string,
  contents: string,
  content: string,
  expected: boolean,
) => {
  if (contents.includes(content) !== expected) {
    console.error(
      `\`${ruleName}\` rule doc should ${
        expected ? '' : 'not '
      }have included: ${content}`,
    );
    process.exitCode = 1;
  }
};

// copied from https://github.com/babel/babel/blob/d8da63c929f2d28c401571e2a43166678c555bc4/packages/babel-helpers/src/helpers.js#L602-L606
/* istanbul ignore next */
const interopRequireDefault = (obj: any): { default: any } =>
  obj && obj.__esModule ? obj : { default: obj };

const importDefault = (moduleName: string) =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  interopRequireDefault(require(moduleName)).default;

const requireJestRule = (name: string): RuleModule =>
  importDefault(path.join(pathTo.rules, name)) as RuleModule;

const details: RuleDetails[] = Object.keys(plugin.rules)
  .map(name => [name, requireJestRule(name)] as const)
  .filter(
    (nameAndRule): nameAndRule is [string, Required<RuleModule>] =>
      !!nameAndRule[1].meta,
  )
  .map(
    ([name, rule]): RuleDetails => ({
      name,
      description: rule.meta.docs.description,
      fixable: rule.meta.fixable
        ? 'fixable'
        : rule.meta.hasSuggestions
        ? 'suggest'
        : false,
      requiresTypeChecking: rule.meta.docs.requiresTypeChecking ?? false,
      deprecated: rule.meta.deprecated ?? false,
      schema: rule.meta.schema,
    }),
  );

details.forEach(({ name, description, schema }) => {
  const pathToDoc = path.join(pathTo.docs, 'rules', `${name}.md`);
  const contents = fs.readFileSync(pathToDoc).toString();
  const lines = contents.split('\n');

  // Regenerate the header (title/notices) of each rule doc.
  const newHeaderLines = generateRuleHeaderLines(description, name);

  replaceOrCreateHeader(lines, newHeaderLines, END_RULE_HEADER_MARKER);

  fs.writeFileSync(pathToDoc, format(lines.join('\n')));

  // Check for potential issues with the rule doc.

  const hasOptions =
    (Array.isArray(schema) && schema.length > 0) ||
    (typeof schema === 'object' && Object.keys(schema).length > 0);

  expectContent(name, contents, '## Rule details', true);
  expectContent(name, contents, '## Options', hasOptions);
});

const [baseRules, typeRules] = details.reduce<[RuleDetails[], RuleDetails[]]>(
  (groups, details) => {
    groups[details.requiresTypeChecking ? 1 : 0].push(details);

    return groups;
  },
  [[], []],
);

let readme = fs.readFileSync(pathTo.readme, 'utf8');

readme = updateRulesList('base', baseRules, readme);
readme = updateRulesList('type', typeRules, readme);

fs.writeFileSync(pathTo.readme, format(readme), 'utf8');
