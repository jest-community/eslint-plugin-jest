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
    files: [
      '**/*.{test,spec}.{js,cjs,mjs,jsx,ts,tsx}',
      '**/__tests__/*.{js,cjs,mjs,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals,
    },
    plugins: {
      jest,
    },
    rules: legacy.configs.all.rules,
  },
];
