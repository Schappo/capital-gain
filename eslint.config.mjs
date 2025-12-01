import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

/**
 * Flat ESLint config equivalent to .eslintrc.json
 * - eslint:recommended
 * - plugin:@typescript-eslint/recommended
 * - plugin:prettier/recommended (via plugin + config)
 */
export default [
  // Ignore build and vendor folders (migrated from .eslintignore)
  { ignores: ['dist/**', 'node_modules/**'] },
  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript-specific rules and parser
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
      // Define Node/ES globals used by the CLI (console, process, etc.)
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Mirror plugin:@typescript-eslint/recommended
      ...tsPlugin.configs.recommended.rules,
      // Disable in TS – TypeScript handles undefined variables
      'no-undef': 'off',
      // Mirror plugin:prettier/recommended rule enablement
      'prettier/prettier': 'error',
    },
  },

  // Disable formatting-related ESLint rules to defer to Prettier
  eslintConfigPrettier,
];
