module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: ["standard-with-typescript"],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports,
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-inferrable-types": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-var-requires": "off",
    "array-bracket-spacing": ["error", "always"],
    "computed-property-spacing": "off",
    "no-warning-comments": "error",
  },
};
