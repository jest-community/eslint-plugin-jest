import { snapshotProcessor } from '../snapshot-processor';

describe('snapshot-processor', () => {
  it('exports an object with preprocess and postprocess functions', () => {
    expect(snapshotProcessor).toMatchObject({
      preprocess: expect.any(Function),
      postprocess: expect.any(Function),
    });
  });

  describe('preprocess function', () => {
    it('should pass on untouched source code to source array', () => {
      const { preprocess } = snapshotProcessor;
      const sourceCode = "const name = 'johnny bravo';";
      const result = preprocess(sourceCode);

      expect(result).toEqual([sourceCode]);
    });
  });

  describe('postprocess function', () => {
    it('should only return messages about snapshot specific rules', () => {
      const { postprocess } = snapshotProcessor;
      const result = postprocess([
        ['no-console', 'global-require', 'jest/no-large-snapshots'].map(
          ruleId => ({ ruleId }),
        ),
      ]);

      expect(result).toEqual([{ ruleId: 'jest/no-large-snapshots' }]);
    });
  });
});
