// https://eslint.org/docs/developer-guide/working-with-plugins#processors-in-plugins
// https://github.com/typescript-eslint/typescript-eslint/issues/808
import type { TSESLint } from '@typescript-eslint/utils';
import {
  name as packageName,
  version as packageVersion,
} from '../../package.json';

type SnapshotProcessor = Required<TSESLint.Linter.Processor>;

export const meta = { name: packageName, version: packageVersion };
export const preprocess: SnapshotProcessor['preprocess'] = source => [source];
export const postprocess: SnapshotProcessor['postprocess'] = messages =>
  // snapshot files should only be linted with snapshot specific rules
  messages[0].filter(message => message.ruleId === 'jest/no-large-snapshots');
