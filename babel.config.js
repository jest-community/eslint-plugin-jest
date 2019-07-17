'use strict';

module.exports = {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: 6 } }],
  ],
};
