// Minimal ESLint flat config for Orion SaaS.
// ESLint is ignored during `next build` (see next.config.ts), so this only
// serves editor/`next lint` usage.
const eslintConfig = [
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
