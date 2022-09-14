import globals from '../globals.json';
import jest from '../index';
import legacy from '../legacy';

export default [
  {
    files: ['**/*.snap'],
    plugins: {
      jest,
    },
    processor: 'jest/.snap',
  },
  {
    languageOptions: {
      globals,
    },
    plugins: {
      jest,
    },
    rules: legacy.configs.recommended.rules,
  },
];
