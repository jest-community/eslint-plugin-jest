// https://eslint.org/docs/developer-guide/working-with-plugins#processors-in-plugins

type PostprocessMessage = { ruleId: string };

export const snapshotProcessor = {
  preprocess: (source: string): string[] => [source],
  postprocess: (messages: PostprocessMessage[][]) =>
    // snapshot files should only be linted with snapshot specific rules
    messages[0].filter(message => message.ruleId === 'jest/no-large-snapshots'),
};
