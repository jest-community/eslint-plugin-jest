#!/usr/bin/env ts-node-transpile-only

import * as fs from 'fs';
import * as path from 'path';
import { TSESLint } from '@typescript-eslint/utils';
import prettier, { Options } from 'prettier';
import { prettier as prettierRC } from '../package.json';
import plugin from '../src/index';
import {
  RULE_NOTICE_MARK_END,
  RULE_NOTICE_MARK_START,
  getRuleNoticeLines,
} from './rule-notices';

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

const updateRuleNotices = (contents, ruleName) => {
  // Determine where to insert rule notices.
  let ruleNoticeMarkStartLine = contents.findIndex(
    line => line === RULE_NOTICE_MARK_START,
  );
  let ruleNoticeMarkEndLine = contents.findIndex(
    line => line === RULE_NOTICE_MARK_END,
  );

  // Add rule notice markers if they don't exist
  if (ruleNoticeMarkStartLine === -1) {
    contents.splice(2, 0, RULE_NOTICE_MARK_START, RULE_NOTICE_MARK_END);
    ruleNoticeMarkStartLine = 2;
    ruleNoticeMarkEndLine = 3;
  }

  // Insert rule notices between markers.
  contents.splice(
    ruleNoticeMarkStartLine + 1,
    ruleNoticeMarkEndLine - ruleNoticeMarkStartLine - 1,
    ...getRuleNoticeLines(ruleName),
  );
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
    }),
  );

details.forEach(({ name, description }) => {
  const pathToDoc = path.join(pathTo.docs, 'rules', `${name}.md`);

  const contents = fs.readFileSync(pathToDoc).toString().split('\n');

  // Replace the title.
  contents[0] = `# ${description} (\`${name}\`)`;

  updateRuleNotices(contents, name);

  fs.writeFileSync(pathToDoc, format(contents.join('\n')));
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
