import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The cloud follow-up route imports the repository's canonical cadence
  // engine so localhost and Vercel cannot drift. Make that explicit instead of
  // relying on lockfile inference; Vercel checks out this complete repository.
  turbopack: { root: path.resolve(import.meta.dirname, "..") },
  // Allow a throwaway build dir (e.g. BUILD_DIST=.next-prod) so a production
  // `next build` can run without clobbering a live `next dev` .next.
  ...(process.env.BUILD_DIST ? { distDir: process.env.BUILD_DIST } : {}),
};

export default nextConfig;
