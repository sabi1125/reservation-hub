module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'arrow-body-style': 'error',
    'arrow-spacing': 'error',
    'generator-star-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'no-param-reassign': ['error', { props: false }],
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'rest-spread-spacing': 'error',
    semi: ['error', 'never'],
  },
}
