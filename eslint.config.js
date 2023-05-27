// ts-check
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    files: ["src/{common,plugin,ui}/**/*{.ts,.tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: "2017",
        project: ["src/common/tsconfig.json", "src/plugin/tsconfig.json"],
      },
    },
    plugins: {
      import: importPlugin,
      "@typescript-eslint": tsPlugin,
      tsPlugin,
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "object-shorthand": "error",
      "import/no-unresolved": "off",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/no-unused-vars": [
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
    parserPath: tsParser,
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        project: ["src/ui/tsconfig.json"],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: reactPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "import/no-unresolved": "off",
    },
  },
];
