'use strict';

// todo: https://github.com/babel/babel/issues/8529 :'(
module.exports = {
  plugins: ['replace-ts-export-assignment'],
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: 10 } }],
  ],
  ignore: ['src/**/__tests__/fixtures/**'],
};
