const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = mergeConfig(defaultConfig, {
  resolver: {
    // Faz o Metro preferir builds compatíveis com RN/browser
    resolverMainFields: ['react-native', 'browser', 'main'],
    blockList: exclusionList([
        /node_modules\/axios\/dist\/node\/.*/,
      ]),
  },
});