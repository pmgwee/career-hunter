export const SYNC_EXACT_FILES = new Set([
  "article-digest.md",
  "cv.md",
  "portals.yml",
  "tracker-aliases.json",
  "config/profile.yml",
  "modes/_profile.md",
  "modes/_custom.md",
  "voice-dna.md",
]);

export const SYNC_PREFIXES = ["data/", "reports/", "interview-prep/", "writing-samples/"];
export const SYNC_EXCLUDED_PREFIXES = ["data/cache/"];
export const SYNC_TEXT_EXTENSIONS = new Set([".md", ".tsv", ".csv", ".json", ".yml", ".yaml", ".txt"]);
export const MAX_SYNC_FILES = 1_000;
export const MAX_SYNC_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_SYNC_TOTAL_BYTES = 20 * 1024 * 1024;

export function isSyncablePath(raw: string): boolean {
  const value = raw.replaceAll("\\", "/");
  if (!value || value.startsWith("/") || value.includes("\0") || value.split("/").includes("..")) return false;
  if (SYNC_EXCLUDED_PREFIXES.some((prefix) => value.startsWith(prefix))) return false;
  if (SYNC_EXACT_FILES.has(value)) return true;
  const dot = value.lastIndexOf(".");
  const extension = dot >= 0 ? value.slice(dot).toLowerCase() : "";
  return SYNC_PREFIXES.some((prefix) => value.startsWith(prefix)) && SYNC_TEXT_EXTENSIONS.has(extension);
}
