import path from "node:path";
import { parsePdfManifestRows } from "./apply/cv-selection.mjs";

/** Fallback kind for a generated PDF with no manifest row. Shared by local
 *  discovery (documents.ts) and the cloud documents route so both classify
 *  the same filename the same way.
 *  @param {string} filename @returns {"cv"|"cover"|"unknown"} */
export function classifyDocumentFilename(filename) {
  const name = path.posix.basename(String(filename)).toLowerCase().replace(/\.pdf$/, "");
  if (name.startsWith("cv-")) return "cv";
  if (/^cover([-_]|$)/.test(name) || /[-_]cover$/.test(name)) return "cover";
  return "unknown";
}

const normalize = (value) => path.posix.normalize(String(value).replace(/\\/g, "/")).replace(/^\.\//, "");

/** Metadata for a cloud artifact row, read from the synced data/pdf-index.tsv
 *  the same way local discovery reads it (latest matching row wins), falling
 *  back to the filename rule and the upload date.
 *  @param {{path: string, updated_at: string}} row @param {string} manifestText */
export function cloudDocumentMetadata(row, manifestText) {
  const target = normalize(row.path);
  const entry = parsePdfManifestRows(manifestText).filter((r) => r.pdf && normalize(r.pdf) === target).at(-1);
  const kind = entry && entry.kind !== "unknown" ? entry.kind : classifyDocumentFilename(row.path);
  return {
    kind,
    reportId: entry?.reportId || null,
    date: entry?.date || String(row.updated_at).slice(0, 10),
    format: entry?.format || "pdf",
  };
}
