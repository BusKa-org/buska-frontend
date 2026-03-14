const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = mergeConfig(defaultConfig, {
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    blockList: exclusionList([
      /node_modules\/axios\/dist\/node\/.*/,
    ]),
  },
});