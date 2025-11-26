import agentConfig from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...agentConfig,
  publishablePackageJson,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.mjs'],
  },
  {
    rules: {
      // Allow hardcoded API URLs for external services
      'default/no-hardcoded-urls': 'off',
      // Allow generic errors for simple CLI app
      'error/no-generic-error': 'off',
      'error/require-custom-error': 'off',
      'error/no-throw-literal': 'off',
      // Allow type assertions for external API responses
      'no-restricted-syntax': 'off',
      // Allow optional chaining for cleaner code
      'no-optional-chaining/no-optional-chaining': 'off',
      // Allow multiple exports in utility files
      'single-export/single-export': 'off',
      // Entry point files don't need spec files
      'ddd/require-spec-file': [
        'error',
        { excludePatterns: ['**/cli.ts', '**/index.ts'] },
      ],
      // Allow longer files for CLI and test files
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
]
