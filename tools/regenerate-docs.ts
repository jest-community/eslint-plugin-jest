#!/usr/bin/env ts-node-transpile-only

import * as fs from 'fs';
import * as path from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import prettier, { Options } from 'prettier';
import { prettier as prettierRC } from '../package.json';
import config from '../src/index';

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
}

type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
  meta: Required<Pick<TSESLint.RuleMetaData<string>, 'docs'>>;
};

const staticElements = {
  listHeaderRow: ['Rule', 'Description', 'Configurations', 'Fixable'],
  listSpacerRow: Array(5).fill('-'),
};

const getConfigurationColumnValueForRule = (rule: RuleDetails): string => {
  if (`jest/${rule.name}` in config.configs.recommended.rules) {
    return '![recommended][]';
  }

  if (`jest/${rule.name}` in config.configs.style.rules) {
    return '![style][]';
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

// copied from https://github.com/babel/babel/blob/d8da63c929f2d28c401571e2a43166678c555bc4/packages/babel-helpers/src/helpers.js#L602-L606
/* istanbul ignore next */
const interopRequireDefault = (obj: any): { default: any } =>
  obj && obj.__esModule ? obj : { default: obj };

const importDefault = (moduleName: string) =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  interopRequireDefault(require(moduleName)).default;

const requireJestRule = (name: string): RuleModule =>
  importDefault(path.join(pathTo.rules, name)) as RuleModule;

const details: RuleDetails[] = Object.keys(config.configs.all.rules)
  .map(name => name.split('/')[1])
  .map(name => [name, requireJestRule(name)] as const)
  .filter(
    (nameAndRule): nameAndRule is [string, Required<RuleModule>] =>
      !!nameAndRule[1].meta && !nameAndRule[1].meta.deprecated,
  )
  .map(
    ([name, rule]): RuleDetails => ({
      name,
      description: rule.meta.docs.description,
      fixable: rule.meta.fixable
        ? 'fixable'
        : rule.meta.docs.suggestion
        ? 'suggest'
        : false,
      requiresTypeChecking: rule.meta.docs.requiresTypeChecking ?? false,
    }),
  );

details.forEach(({ name, description }) => {
  const pathToDoc = path.join(pathTo.docs, 'rules', `${name}.md`);

  const contents = fs.readFileSync(pathToDoc).toString().split('\n');

  contents[0] = `# ${description} (\`${name}\`)`;

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
