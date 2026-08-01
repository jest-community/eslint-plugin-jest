'use strict';

const semver = require('semver');
const pkg = require('./package.json');

const supportedNodeVersion = semver.minVersion(pkg.engines.node)?.version;

// todo: https://github.com/babel/babel/issues/8529 :'(
/** @type {import('@babel/core').TransformOptions} */
const config = {
  plugins: ['replace-ts-export-assignment'],
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: supportedNodeVersion } }],
  ],
  ignore: process.env.NODE_ENV === 'test' ? [] : ['**/__tests__/**'],
};

module.exports = config;
