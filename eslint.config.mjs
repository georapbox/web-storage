import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.chai,
        ...globals.mocha
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-use-before-define': [
        'error',
        {
          functions: false
        }
      ],
      curly: ['warn'],
      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore'
        }
      ]
    }
  },
  {
    ignores: ['dist', 'docs/lib', 'coverage']
  }
];
