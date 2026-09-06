// eslint-config-next 16 ships flat configs as plain arrays. Wrapping them in FlatCompat — which
// is what the 15.x setup needed — makes ESLint crash with "Converting circular structure to JSON",
// so they are spread in directly.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Separate agent worktrees are not source for this checkout.
      ".claude/worktrees/**",
      // Vendored design handoff export, not project source
      "VR extraction shooter webapp redesign/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
