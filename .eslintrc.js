module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'algolia/jest',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint', 'jest'
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"]
      }
    }
  },
};
