import js from "@eslint/js";

export default [
  {
    ...js.configs.recommended,
    ignores: ["coverage", "dist", "tmp"],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];
