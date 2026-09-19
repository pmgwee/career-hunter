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
if (!token) throw new Error("CAREER_OPS_SYNC_TOKEN is missing. Add it to web/.env.local after creating a device token in Config.");

const exact = ["article-digest.md", "cv.md", "portals.yml", "tracker-aliases.json", "config/profile.yml", "modes/_profile.md", "modes/_custom.md", "voice-dna.md"];
const roots = ["data", "reports", "interview-prep", "writing-samples"];
const extensions = new Set([".md", ".tsv", ".csv", ".json", ".yml", ".yaml", ".txt"]);
const sent = new Map();

async function collectTree(relative, output) {
  const absolute = path.join(projectRoot, relative);
  let entries;
  try { entries = await fs.readdir(absolute, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const child = path.posix.join(relative.replaceAll("\\", "/"), entry.name);
    if (entry.isDirectory()) await collectTree(child, output);
    else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) output.add(child);
  }
}

async function snapshot() {
  const paths = new Set(exact);
  for (const root of roots) await collectTree(root, paths);
  const files = [];
  for (const relative of [...paths].sort()) {
    let content;
    try { content = await fs.readFile(path.join(projectRoot, relative), "utf8"); } catch { continue; }
    const hash = createHash("sha256").update(content).digest("hex");
    if (sent.get(relative) === hash) continue;
    files.push({ path: relative, content, contentType: "text/plain; charset=utf-8", hash });
  }
  return files;
}

async function push() {
  const files = await snapshot();
  if (!files.length) return;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ files: files.map(({ path: filePath, content, contentType }) => ({ path: filePath, content, contentType })) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Sync failed with HTTP ${response.status}`);
  files.forEach((file) => sent.set(file.path, file.hash));
  console.log(`Synced ${files.length} file(s) to cloud workspace at revision ${result.revision}.`);
}

async function pull() {
  const response = await fetch(endpoint, { headers: { authorization: `Bearer ${token}` } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Pull failed with HTTP ${response.status}`);
  let changed = 0;
  for (const file of Array.isArray(result.files) ? result.files : []) {
    const relative = String(file.path || "").replaceAll("\\", "/");
    if (!relative || relative.startsWith("/") || relative.split("/").includes("..")) continue;
    const content = String(file.content ?? "");
    const hash = createHash("sha256").update(content).digest("hex");
    const absolute = path.resolve(projectRoot, relative);
    if (!absolute.startsWith(projectRoot + path.sep)) continue;
    let localHash = "";
    try { localHash = createHash("sha256").update(await fs.readFile(absolute)).digest("hex"); } catch { /* missing */ }
    if (localHash === hash) { sent.set(relative, hash); continue; }
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    const temporary = `${absolute}.cloud-sync-${process.pid}.tmp`;
    await fs.writeFile(temporary, content, "utf8");
    await fs.rename(temporary, absolute);
    sent.set(relative, hash);
    changed += 1;
  }
  if (changed) console.log(`Pulled ${changed} cloud change(s) into the local workspace.`);
}

await push();
await pull();
if (watch) {
  console.log("Watching local career data for changes. Press Ctrl+C to stop.");
  setInterval(() => push().then(pull).catch((error) => console.error(error.message)), 15_000);
}
