// @ts-check
import parser from "@typescript-eslint/parser";
import tsLintPlugin from "@typescript-eslint/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import * as importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";

export default [
  {
    files: ["./src/**/*{.ts,.tsx}"],
    plugins: {
      importPlugin,
      tsLintPlugin,
    },
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "2019",
        project: [
          ".src/common/tsconfig.json",
          ".src/plugin/tsconfig.json",
          ".src/ui/tsconfig.json",
        ],
      },
    },
    rules: {
      "tsLintPlugin/consistent-type-exports": "error",
      "tsLintPlugin/consistent-type-imports": "error",
      "tsLintPlugin/no-non-null-assertion": "off",
      "tsLintPlugin/no-unnecessary-type-assertion": "error",
      "tsLintPlugin/array-type": ["error", { default: "array-simple" }],
      "tsLintPlugin/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/ui/**/*{.ts,.tsx}"],
    plugins: {
      reactPlugin,
      jsxA11yPlugin,
      reactHooksPlugin,
    },
    languageOptions: {
      parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
      },
    },
    rules: {
      "reactHooksPlugin/rules-of-hooks": "error",
      "reactHooksPlugin/exhaustive-deps": "warn",
    },
  },
];
