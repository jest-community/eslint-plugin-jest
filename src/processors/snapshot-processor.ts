// https://eslint.org/docs/developer-guide/working-with-plugins#processors-in-plugins
// https://github.com/typescript-eslint/typescript-eslint/issues/808
import {
  name as packageName,
  version as packageVersion,
} from '../../package.json';

type PostprocessMessage = { ruleId: string };

export const meta = { name: packageName, version: packageVersion };
export const preprocess = (source: string): string[] => [source];
export const postprocess = (messages: PostprocessMessage[][]) =>
  // snapshot files should only be linted with snapshot specific rules
  messages[0].filter(message => message.ruleId === 'jest/no-large-snapshots');
