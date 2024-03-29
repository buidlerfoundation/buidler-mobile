module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-shadow': 'off',
        'no-undef': 'error',
        'react-native/no-inline-styles': 'off',
        radix: 'off',
        curly: 'off',
        'no-alert': 'off',
      },
    },
  ],
};
