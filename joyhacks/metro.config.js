const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx'],
  assetExts: ['png', 'jpg', 'jpeg', 'gif', 'wav', 'mp3', 'mp4'],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'stream': require.resolve('stream-browserify'),
  }
};

module.exports = config;