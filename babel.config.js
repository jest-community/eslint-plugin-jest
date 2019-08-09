'use strict';

module.exports = {
  plugins: ['replace-ts-export-assignment'],
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: 6 } }],
  ],
};
