import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...pluginOxlint.configs['flat/recommended'],
  skipFormatting,
  {
    // Prevent direct, ad-hoc checks for specific upgrade ids in code. Encourage
    // using the centralized helper `upgradeUtils.hasUpgradeById` instead.
    files: ['**/*.{js,vue}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.type="MemberExpression"][callee.property.name="some"][callee.object.name="selectedUpgrades"]',
          message:
            'Avoid calling selectedUpgrades.some(...) directly to check for upgrades. Use upgradeUtils.hasUpgradeById(selectedUpgrades, "<id>") instead.',
        },
        {
          selector: 'CallExpression[callee.type="MemberExpression"][callee.property.name="includes"][callee.object.name="selectedUpgrades"]',
          message:
            'Avoid calling selectedUpgrades.includes(...) directly to check for upgrades. Use upgradeUtils.hasUpgradeById(selectedUpgrades, "<id>") instead.',
        },
        {
          selector: 'BinaryExpression[operator="==="][right.type="Literal"][right.value="u6"][left.type="MemberExpression"][left.property.name="id"]',
          message:
            'Avoid ad-hoc comparisons like upg.id === "u6". Use upgradeUtils.hasUpgradeById(selectedUpgrades, "u6") instead.',
        },
        {
          selector: 'BinaryExpression[operator="==="][left.type="Literal"][left.value="u6"][right.type="MemberExpression"][right.property.name="id"]',
          message:
            'Avoid ad-hoc comparisons like "u6" === upg.id. Use upgradeUtils.hasUpgradeById(selectedUpgrades, "u6") instead.',
        },
      ],
    },
  },
])
