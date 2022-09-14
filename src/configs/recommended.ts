import legacy from '../legacy';
import all from './all';

const [snap, test] = all;

export default [
  snap,
  {
    ...test,
    rules: legacy.configs.recommended.rules,
  },
];
