// These release features require a writable local checkout or a CLI/browser
// worker. Never acknowledge a write to Vercel's ephemeral filesystem as saved.
const LOCAL_WORKER_PREFIXES = [
  "/api/assistant/chats", "/api/cv-studio", "/api/personalization",
  "/api/scheduled-jobs", "/api/scheduler", "/api/inbox/skip",
  "/api/profile", "/api/memory", "/api/portals", "/api/run", "/api/runs/save",
];
export function requiresLocalWorker(pathname) {
  return LOCAL_WORKER_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}
export function rejectsCrossOriginWrite({ method, origin, site, requestOrigin }) {
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return false;
  if (site === "cross-site" || site === "same-site") return true;
  return Boolean(origin && origin !== requestOrigin);
}
