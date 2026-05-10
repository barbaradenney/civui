// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [{
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

    // Prevent two anti-patterns from sibling @civui/* packages in component source:
    //   1. Named class imports (`import { CivTextInput }`) — get tree-shaken,
    //      silently breaking custom-element registration.
    //   2. Barrel side-effect imports (`import '@civui/inputs'`) — pull in
    //      *every* component in the barrel, defeating consumer tree-shaking.
    //      Use a sub-path instead: `import '@civui/inputs/text-input';`.
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: '@civui/inputs', message: 'Use sub-path imports: `import \'@civui/inputs/text-input\'`. Barrel imports register every component, defeating tree-shaking for consumers.' },
          { name: '@civui/controls', message: 'Use sub-path imports: `import \'@civui/controls/radio\'`. Barrel imports register every component.' },
          { name: '@civui/actions', message: 'Use sub-path imports: `import \'@civui/actions/button\'`.' },
          { name: '@civui/overlays', message: 'Use sub-path imports: `import \'@civui/overlays/modal\'`.' },
          { name: '@civui/layout', message: 'Use sub-path imports: `import \'@civui/layout/card\'`.' },
          { name: '@civui/feedback', message: 'Use sub-path imports: `import \'@civui/feedback/alert\'`.' },
          { name: '@civui/navigation', message: 'Use sub-path imports: `import \'@civui/navigation/link\'`.' },
          { name: '@civui/form-patterns', message: 'Use sub-path imports: `import \'@civui/form-patterns/form\'`.' },
          { name: '@civui/compound', message: 'Use sub-path imports: `import \'@civui/compound/address\'`.' },
        ],
        patterns: [
          {
            group: ['@civui/inputs', '@civui/inputs/*', '@civui/controls', '@civui/controls/*', '@civui/compound', '@civui/compound/*', '@civui/actions', '@civui/actions/*', '@civui/overlays', '@civui/overlays/*', '@civui/layout', '@civui/layout/*', '@civui/feedback', '@civui/feedback/*', '@civui/navigation', '@civui/navigation/*', '@civui/form-patterns', '@civui/form-patterns/*'],
            importNamePattern: '^Civ',
            message: 'Named class imports get tree-shaken — custom-element registration is a side effect. Use a side-effect sub-path import instead: `import \'@civui/inputs/text-input\'`.',
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
}, {
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
}, {
  // CLI and content validator use console.log for output
  files: [
    'packages/cli/src/**/*.ts',
    'packages/content/src/validate/cli.ts',
  ],
  rules: {
    'no-console': 'off',
  },
}, {
  // Stories use any for event handlers
  files: ['packages/*/src/**/*.stories.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
    'no-restricted-imports': 'off',
  },
}, {
  // MCP server and CLI tools use named imports for code generation
  files: ['packages/mcp-server/src/**/*.ts', 'packages/codegen/src/**/*.ts'],
  rules: {
    'no-restricted-imports': 'off',
  },
}, {
  // Ignore generated declaration files
  ignores: ['packages/*/src/**/*.d.ts'],
}, ...storybook.configs["flat/recommended"]];
