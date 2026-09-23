import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The spawned root scanner imports js-yaml outside the Next bundle. Trace
  // its web-installed package and the preload that resolves it at runtime.
  outputFileTracingIncludes: {
    "/api/explore": [
      "./src/lib/core/scanner-preload.mjs",
      "./src/lib/core/scanner-resolve.mjs",
      "./node_modules/js-yaml/**/*",
    ],
  },
  // The cloud follow-up route imports the repository's canonical cadence
  // engine so localhost and Vercel cannot drift. Make that explicit instead of
  // relying on lockfile inference; Vercel checks out this complete repository.
  turbopack: {
    root: path.resolve(import.meta.dirname, ".."),
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
