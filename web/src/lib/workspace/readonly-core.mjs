import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";
import { parseCliJson } from "../status-cli.mjs";

const READERS = new Set(["stats", "analyze-patterns", "company-history", "keyword-match", "upskill", "rejection-latency"]);
export function safeSnapshotPath(value) {
  return typeof value === "string" && value.length > 0 && !value.includes("\\") && !value.includes("\0")
    && !path.posix.isAbsolute(value) && !value.includes(":")
    && value.split("/").every((part) => part && part !== "." && part !== "..");
}

/** Child env for a snapshot read: every inherited CAREER_OPS_* override is
 * dropped (canonical readers honor e.g. CAREER_OPS_PROFILE ahead of the data
 * root, which would pull local files into cloud results), then the data root
 * and tracker are bound to the snapshot directory.
 * @param {string} root @param {NodeJS.ProcessEnv} [base] */
export function snapshotEnv(root, base = process.env) {
  const env = Object.fromEntries(Object.entries(base).filter(([key]) => !key.toUpperCase().startsWith("CAREER_OPS_")));
  return { ...env, CAREER_OPS_ROOT: root, CAREER_OPS_DATA_DIR: root, CAREER_OPS_TRACKER: path.join(root, "data", "applications.md") };
}

/** Run an allowlisted, read-only canonical engine against an isolated cloud
 * snapshot. No process-global data-root change, local fallback or cloud write.
 * File arguments are resolved only inside this request's temporary directory.
 * @param {{files: ReadonlyMap<string,string>, codeRoot: string, script: string, args?: Array<string|{file:string}>}} options
 */
export async function runReadonlyCore({ files, codeRoot, script, args = [] }) {
  if (!READERS.has(script)) throw new Error("Unsupported read-only engine");
  for (const name of files.keys()) if (!safeSnapshotPath(name)) throw new Error("Invalid snapshot path");
  for (const arg of args) if (typeof arg !== "string" && !safeSnapshotPath(arg?.file)) throw new Error("Invalid file argument");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "career-cloud-read-"));
  try {
    for (const [name, content] of files) {
      const destination = path.join(root, name);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, content, "utf8");
    }
    const preload = process.env.VERCEL
      ? ["--import", pathToFileURL(path.join(process.cwd(), "src/lib/core/scanner-preload.mjs")).href] : [];
    const argv = [...preload, path.join(/* turbopackIgnore: true */ codeRoot, `${script}.mjs`), ...args.map((arg) => typeof arg === "string" ? arg : path.join(root, arg.file))];
    const result = await new Promise((resolve) => {
      execFile(process.execPath, argv, {
        cwd: codeRoot, timeout: 25_000, maxBuffer: 8 << 20, windowsHide: true,
        env: snapshotEnv(root),
      }, (error, stdout, stderr) => resolve({ error, stdout, stderr }));
    });
    return { data: parseCliJson(result.stdout), failed: Boolean(result.error), noKeywords: /keywords extracted/i.test(result.stderr) };
  } finally {
    if (path.dirname(path.resolve(root)) !== path.resolve(os.tmpdir()) || !path.basename(root).startsWith("career-cloud-read-")) {
      throw new Error("Unsafe temporary directory cleanup");
    }
    await fs.rm(root, { recursive: true, force: true });
  }
}
