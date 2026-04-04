module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-react',
    '@babel/preset-env',
  ],
  plugins: [
    'react-native-web',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '^react-native$': 'react-native-web',
        },
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
        ],
      },
    ],
  ],
};