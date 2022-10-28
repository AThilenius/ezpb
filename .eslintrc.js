// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: [
    "@typescript-eslint",
  ],
  env: {
    jest: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  rules: {
    "no-constant-condition": ['warn', { checkLoops: false }],
    "@typescript-eslint/no-floating-promises": ['warn'],
    "@typescript-eslint/explicit-member-accessibility": ['warn', {
      overrides: {
        accessors: 'off',
        constructors: 'no-public',
      }
    }],

    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },

  overrides: [{
    files: ["**/migration/*.ts"],
    rules: {
      "@typescript-eslint/explicit-member-accessibility": "off",
    }
  }],
}
