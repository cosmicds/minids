module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    'parser': '@typescript-eslint/parser'
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    "no-unused-vars": [
      "error", {
        "args": "all",
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "semi": "off",
    "@typescript-eslint/naming-convention": [
      "error", {
        selector: ["variable"],
        format: ["camelCase"]
      },
      {
        selector: ["variable"],
        modifiers: ["global", "const"],
        format: ["camelCase", "UPPER_CASE"]
      },
      {
        selector: ["function"],
        format: ["camelCase"]
      },
      {
        selector: "typeLike",
        format: ["PascalCase"]
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error", {
        "args": "all",
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/semi": "error"
  }
};
