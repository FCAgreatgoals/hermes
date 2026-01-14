import globals from "globals";
import tseslint from "typescript-eslint";
import tsstyle from "@stylistic/eslint-plugin";

const COMPLEXITY_THRESHOLD = 10;
const MAX_PARAMS = 4;

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        plugins: { style: tsstyle },
        files: ["**/*.{js,mjs,cjs,ts}"],
        rules: {
            "no-delete-var": "error",
            "no-duplicate-imports": "error",
            "style/semi": ["error", "always"],
            "no-trailing-spaces": "error",
            "no-dupe-keys": "error",
            "no-var": "error",
            "no-unused-vars": "error",
            "no-cond-assign": "error",
            "no-invalid-regexp": "error",
            "no-inner-declarations": "error",
            "no-self-assign": "error",
            "no-sparse-arrays": "warn",
            "prefer-const": "error",
            "no-useless-return": "warn",
            "no-useless-constructor": "warn",
            "no-unreachable": "warn",
            "use-isnan": "warn",
            eqeqeq: ["warn", "smart"],
            "no-else-return": "warn",
            "no-new-func": "error",
            yoda: "warn",
            "no-shadow-restricted-names": "error",
            complexity: ["warn", COMPLEXITY_THRESHOLD],
            "max-params": ["warn", MAX_PARAMS],
            "require-await": "warn",
            "no-unmodified-loop-condition": "warn",
            "no-useless-assignment": "error",
            "no-misleading-character-class": "error",
            "no-unsafe-negation": "warn",
            "no-warning-comments": "warn",
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.node,
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly"
            }
        }
    },
    ...tseslint.configs.recommended,
];
