import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import next from 'eslint-config-next/core-web-vitals';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist', '.next'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // for Next.js server-side
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // For backwards compatibility TODO: go to strict mode
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/no-unescaped-entities': 'warn',
      'prefer-rest-params': 'warn',
      '@next/next/no-img-element': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
    },
  },
  // Allow namespaces in type declaration files for ViralLoops widgets
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  }
);
