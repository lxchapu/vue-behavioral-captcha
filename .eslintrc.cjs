/*
 * @Author: 杨旭
 * @Date: 2023-02-09 16:31:39
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-09 17:10:26
 * @FilePath: \vue-slide-puzzle\.eslintrc.cjs
 * @Description:
 */
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    'vue/multi-word-component-names': 'off',
  },
}
