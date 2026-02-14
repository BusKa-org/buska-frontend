const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    resolverMainFields: ['react-native', 'main'],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'jsx', 'js', 'json', 'ts', 'tsx'],
    blockList: exclusionList([
      /node_modules\/axios\/dist\/node\/.*/,
    ]),
  },
};

module.exports = mergeConfig(defaultConfig, config);