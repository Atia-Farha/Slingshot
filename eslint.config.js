import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";

export default [
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "src-tauri/gen/**",
            "src-tauri/target/**",
        ],
    },
    js.configs.recommended,
    ...pluginVue.configs["flat/recommended"],
    {
        files: ["**/*.{js,vue}"],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            "vue/html-indent": ["error", 4],
            "vue/multi-word-component-names": "off",
        },
    },
    {
        files: ["*.config.js", "src/**/*.test.js"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.vitest,
            },
        },
    },
];
