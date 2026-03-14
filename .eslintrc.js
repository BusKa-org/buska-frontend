module.exports = {
  root: true,
  extends: ['@react-native'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {
        'no-unused-vars': 'warn',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'dist/',
    'coverage/',
  ],
};