'use strict';

const semver = require('semver');
const pkg = require('./package.json');

const supportedNodeVersion = semver.minVersion(pkg.engines.node)?.version;

/** @type {import('@babel/core').TransformOptions} */
const config = {
  plugins: ['replace-ts-export-assignment'],
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: supportedNodeVersion } }],
  ],
  ignore: ['src/**/__tests__/fixtures/**'],
};

module.exports = config;
