'use strict';

module.exports = {
  ignore: ['**/__tests__/**'],
  presets: [['@babel/preset-env', { targets: { node: 6 } }]],
};
