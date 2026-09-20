/** @type {import('next').NextConfig} */
const nextConfig = {
  // Two lockfiles exist on purpose (repo root + web/), so Next would infer the
  // repo root as the workspace root. On Windows that misinference can send
  // Turbopack's postcss workers into an unbounded respawn loop that exhausts
  // all RAM (vercel/next.js#92978) — pin the root to this app.
  turbopack: {
    root: import.meta.dirname,
    // Vercel installs this app's dependencies under `web/node_modules`, while
    // the canonical follow-up engine lives at the repository root. Keep the
    // shared engine, but make its external YAML dependency resolvable from the
    // root-level import graph during Turbopack builds.
    resolveAlias: {
      "js-yaml": "./node_modules/js-yaml",
    },
  },
  // Allow a throwaway build dir (e.g. BUILD_DIST=.next-prod) so a production
  // `next build` can run without clobbering a live `next dev` .next.
  ...(process.env.BUILD_DIST ? { distDir: process.env.BUILD_DIST } : {}),
};

export default nextConfig;
