// Catches names that are used but never defined or imported; such code only
// fails when a user reaches it. Run with `npm run lint`.
import globals from "globals";

export default [
  {
    files: ["frontend/**/*.js", "scripts/**/*.mjs", "tests/e2e/**/*.mjs", "webpack.config.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, __DD_VERSION__: "readonly" },
    },
    rules: { "no-undef": "error" },
  },
];
