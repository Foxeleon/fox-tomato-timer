import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    // Non-template HTML files and build artifacts are not linted
    ignores: ['src/index.html', 'dist/**', '.angular/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Enforce OnPush change detection strategy for Zoneless Angular
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',

      // Explicitly enforce modern DI (inject) over constructors (from .windsurfrules)
      '@angular-eslint/prefer-inject': 'error',

      // Forbid empty lifecycle methods
      '@angular-eslint/no-empty-lifecycle-method': 'error',

      // Quality of Life: allow unused variables if they start with an underscore
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  // Prettier integration (must be the last configuration object)
  eslintPluginPrettierRecommended
);
