import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "build/**", "dist/**", "*.min.js"]
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "jsx-a11y/alt-text": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "prefer-const": "off",
      "import/no-anonymous-default-export": "off"
    }
  }
];

export default eslintConfig;
