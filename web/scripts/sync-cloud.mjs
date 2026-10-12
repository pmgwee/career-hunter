// Cloud-first two-way sync between this checkout and the career-hunter cloud workspace.
//
// POLICY: the cloud workspace (Vercel prod) is the source of truth. The old version of
// this script pushed every local file before pulling, so a stale local tracker silently
// overwrote 22 cloud-only applications and 11 web status edits on 2026-10-12. The cloud
// keeps only hashes in career_changes, not content, so a blind push cannot be undone.
//
// Three-way merge against the hashes recorded at the last successful sync
// (web/.cloud-sync-state.json, gitignored):
//   cloud == local                 -> nothing to do
//   only cloud changed (or no base) -> cloud overwrites local
//   only local changed             -> local is pushed
//   both changed                   -> CLOUD WINS; the local copy is kept as
//                                     <file>.local-conflict-<timestamp> for review
//   local-only file, never synced  -> pushed (new local work, e.g. a new report)
//   local-only file, synced before -> left alone, NOT pushed (cloud removed it)
// Tracker guard: data/applications.md is never pushed if it would drop a row the cloud has.
//
// Usage: node web/scripts/sync-cloud.mjs [--dry-run] [--watch]
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, "..");
try { process.loadEnvFile(path.join(webRoot, ".env.local")); } catch { /* optional */ }

const projectRoot = path.resolve(process.env.CAREER_OPS_ROOT || path.join(webRoot, ".."));
const endpoint = new URL("/api/sync/push", process.env.CAREER_OPS_SYNC_URL || "https://career-hunter-nine.vercel.app").toString();
const token = process.env.CAREER_OPS_SYNC_TOKEN?.trim();
const watch = process.argv.includes("--watch");
const dryRun = process.argv.includes("--dry-run");
const statePath = path.join(webRoot, ".cloud-sync-state.json");
if (!token) throw new Error("CAREER_OPS_SYNC_TOKEN is missing. Add it to web/.env.local after creating a device token in Config.");

const exact = ["article-digest.md", "cv.md", "portals.yml", "tracker-aliases.json", "config/profile.yml", "modes/_profile.md", "modes/_custom.md", "voice-dna.md"];
const roots = ["data", "reports", "interview-prep", "writing-samples"];
const excludedPrefixes = ["data/cache/"];
const extensions = new Set([".md", ".tsv", ".csv", ".json", ".yml", ".yaml", ".txt"]);
const TRACKER = "data/applications.md";

const sha = (content) => createHash("sha256").update(content).digest("hex");

async function collectTree(relative, output) {
  let entries;
  try { entries = await fs.readdir(path.join(projectRoot, relative), { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const child = path.posix.join(relative.replaceAll("\\", "/"), entry.name);
    if (excludedPrefixes.some((prefix) => child === prefix.slice(0, -1) || child.startsWith(prefix))) continue;
    if (entry.isDirectory()) await collectTree(child, output);
    else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) output.add(child);
  }
}

async function localSnapshot() {
  const paths = new Set(exact);
  for (const root of roots) await collectTree(root, paths);
  const files = new Map();
  for (const relative of paths) {
    try { files.set(relative, await fs.readFile(path.join(projectRoot, relative), "utf8")); } catch { /* absent */ }
  }
  return files;
}

async function request(method, body) {
  const response = await fetch(endpoint, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `${method} failed with HTTP ${response.status}`);
  return result;
}

async function readState() {
  try { return JSON.parse(await fs.readFile(statePath, "utf8")); } catch { return { files: {} }; }
}

function trackerKeys(markdown) {
  return new Set(markdown.split(/\r?\n/).filter((line) => /^\|\s*\d+\s*\|/.test(line)).map((line) => {
    const report = line.match(/reports\/([^)\s|]+)/);
    return report ? report[1] : line.split("|").slice(2, 6).map((cell) => cell.trim().toLowerCase()).join("|");
  }));
}

async function writeLocal(relative, content) {
  const absolute = path.resolve(projectRoot, relative);
  if (!absolute.startsWith(projectRoot + path.sep)) return;
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.cloud-sync-${process.pid}.tmp`;
  await fs.writeFile(temporary, content, "utf8");
  await fs.rename(temporary, absolute);
}

async function sync() {
  const cloud = await request("GET");
  const cloudFiles = new Map();
  for (const file of Array.isArray(cloud.files) ? cloud.files : []) {
    const relative = String(file.path || "").replaceAll("\\", "/");
    if (!relative || relative.startsWith("/") || relative.split("/").includes("..")) continue;
    cloudFiles.set(relative, String(file.content ?? ""));
  }
  const local = await localSnapshot();
  const state = await readState();
  const base = state.files || {};
  const next = { ...base };
  const pulls = [], pushes = [], conflicts = [], skipped = [];

  for (const [relative, content] of cloudFiles) {
    const cloudHash = sha(content);
    let localContent = local.get(relative);
    if (localContent === undefined) {
      try { localContent = await fs.readFile(path.join(projectRoot, relative), "utf8"); } catch { /* absent */ }
    }
    if (localContent === undefined) { pulls.push([relative, content]); next[relative] = cloudHash; continue; }
    const localHash = sha(localContent);
    if (localHash === cloudHash) { next[relative] = cloudHash; continue; }
    const baseHash = base[relative];
    if (baseHash && cloudHash === baseHash) { pushes.push([relative, localContent]); continue; }
    if (baseHash && localHash === baseHash) { pulls.push([relative, content]); next[relative] = cloudHash; continue; }
    conflicts.push([relative, localContent]);
    pulls.push([relative, content]);
    next[relative] = cloudHash;
  }
  for (const [relative, content] of local) {
    if (cloudFiles.has(relative)) continue;
    if (base[relative]) { skipped.push(relative); continue; }
    pushes.push([relative, content]);
  }

  const trackerPush = pushes.find(([relative]) => relative === TRACKER);
  if (trackerPush && cloudFiles.has(TRACKER)) {
    const localKeys = trackerKeys(trackerPush[1]);
    const missing = [...trackerKeys(cloudFiles.get(TRACKER))].filter((key) => !localKeys.has(key));
    if (missing.length) {
      pushes.splice(pushes.indexOf(trackerPush), 1);
      console.error(`REFUSED to push ${TRACKER}: it would remove ${missing.length} cloud row(s): ${missing.slice(0, 5).join(", ")}`);
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  console.log(`${dryRun ? "[dry-run] " : ""}cloud revision ${cloud.revision}: pull ${pulls.length}, push ${pushes.length}, conflicts (cloud wins) ${conflicts.length}, cloud-removed kept local ${skipped.length}`);
  for (const [relative] of conflicts) console.log(`  conflict -> cloud wins: ${relative} (local copy kept as ${relative}.local-conflict-${stamp})`);
  for (const relative of skipped) console.log(`  not pushed (removed in cloud since last sync): ${relative}`);
  if (dryRun) {
    for (const [relative] of pulls) console.log(`  pull ${relative}`);
    for (const [relative] of pushes) console.log(`  push ${relative}`);
    return;
  }

  for (const [relative, content] of conflicts) await writeLocal(`${relative}.local-conflict-${stamp}`, content);
  for (const [relative, content] of pulls) await writeLocal(relative, content);
  if (pushes.length) {
    const result = await request("POST", { files: pushes.map(([filePath, content]) => ({ path: filePath, content, contentType: "text/plain; charset=utf-8" })) });
    for (const [relative, content] of pushes) next[relative] = sha(content);
    console.log(`Pushed ${pushes.length} file(s); cloud revision ${result.revision}.`);
  }
  await fs.writeFile(statePath, JSON.stringify({ updatedAt: new Date().toISOString(), files: next }, null, 2), "utf8");
}

await sync();
if (watch && !dryRun) {
  console.log("Watching (cloud-first). Press Ctrl+C to stop.");
  setInterval(() => sync().catch((error) => console.error(error.message)), 15_000);
}
