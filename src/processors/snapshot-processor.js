// https://eslint.org/docs/developer-guide/working-with-plugins#processors-in-plugins
export const preprocess = source => [source];

export const postprocess = messages =>
  messages[0].filter(
    // snapshot files should only be linted with snapshot specific rules
    message => message.ruleId === 'jest/no-large-snapshots',
  );
