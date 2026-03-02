const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const wdio     = require('eslint-plugin-wdio');

module.exports = [
    // ── Ignored paths ──────────────────────────────────────────────────────────
    {
        ignores: [
            'node_modules/**',
            'allure-results/**',
            'allure-report/**',
            'chromedrivers/**',
        ],
    },

    // ── TypeScript source + test files ─────────────────────────────────────────
    {
        files: ['src/**/*.ts', 'tests/**/*.ts', 'config/**/*.ts'],

        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },

        plugins: {
            '@typescript-eslint': tsPlugin,
            wdio,
        },

        rules: {
            // TypeScript recommended rules (flat/recommended preset)
            ...tsPlugin.configs['flat/recommended'].rules,

            // WebdriverIO recommended rules (flat preset)
            ...wdio.configs['flat/recommended'].rules,

            // Project-specific overrides
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            'no-console': 'off',
        },
    },
];
