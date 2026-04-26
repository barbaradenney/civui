import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['packages/*/src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Prevent named imports from sibling @civui/* packages in component source.
      // Web component registration is a side effect — named imports can be
      // tree-shaken, silently breaking child component rendering.
      // Use bare imports instead: `import '@civui/inputs'` (not `import { CivTextInput } from '@civui/inputs'`)
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@civui/inputs', '@civui/controls', '@civui/compound', '@civui/actions', '@civui/actions/*', '@civui/overlays', '@civui/overlays/*', '@civui/layout', '@civui/layout/*', '@civui/feedback', '@civui/navigation', '@civui/form-patterns'],
              importNamePattern: '^Civ',
              message: 'Use bare side-effect imports for component registration: `import \'@civui/inputs\'` — named imports get tree-shaken.',
            },
          ],
        },
      ],

      // General quality rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    // Relax rules for test files
    files: ['packages/*/src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'off',
      'no-console': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    // CLI and content validator use console.log for output
    files: [
      'packages/cli/src/**/*.ts',
      'packages/content/src/validate/cli.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Stories use any for event handlers
    files: ['packages/*/src/**/*.stories.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    // MCP server and CLI tools use named imports for code generation
    files: ['packages/mcp-server/src/**/*.ts', 'packages/codegen/src/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // Ignore generated declaration files
    ignores: ['packages/*/src/**/*.d.ts'],
  },
];
