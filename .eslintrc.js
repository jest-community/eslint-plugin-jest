module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
  },
  rules: {
    'prettier/prettier': 'error',
  },
};
