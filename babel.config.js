'use strict';

const semver = require('semver');
const pkg = require('./package.json');

const supportedNodeVersion = semver.minVersion(pkg.engines.node).version;

// todo: https://github.com/babel/babel/issues/8529 :'(
module.exports = {
  plugins: ['replace-ts-export-assignment'],
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: supportedNodeVersion } }],
  ],
  ignore: ['src/**/__tests__/fixtures/**'],
};
