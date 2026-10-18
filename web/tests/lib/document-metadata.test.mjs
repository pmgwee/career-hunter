import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyDocumentFilename, cloudDocumentMetadata } from "../../src/lib/document-metadata.mjs";

test("filename fallback matches the local discovery rule", () => {
  assert.equal(classifyDocumentFilename("cv-acme-2026.pdf"), "cv");
  assert.equal(classifyDocumentFilename("cover-acme.pdf"), "cover");
  assert.equal(classifyDocumentFilename("acme_cover.pdf"), "cover");
  // A substring match would call these covers; the shared rule does not.
  assert.equal(classifyDocumentFilename("cv-discovery.pdf"), "cv");
  assert.equal(classifyDocumentFilename("recovery-plan.pdf"), "unknown");
});

test("cloud metadata prefers the synced manifest row, latest entry winning", () => {
  const manifest = [
    "012\toutput/cv-acme.pdf\t\tpdf\t2026-09-01\tcv",
    "013\toutput/cover-acme.pdf\t\tpdf\t2026-09-02\tcover",
    "014\toutput/cv-acme.pdf\t\tpdf\t2026-09-03\tcv",
  ].join("\n");
  const meta = cloudDocumentMetadata({ path: "output/cv-acme.pdf", updated_at: "2026-10-18T05:00:00Z" }, manifest);
  assert.deepEqual(meta, { kind: "cv", reportId: "014", date: "2026-09-03", format: "pdf" });
  const cover = cloudDocumentMetadata({ path: "output/cover-acme.pdf", updated_at: "2026-10-18T05:00:00Z" }, manifest);
  assert.equal(cover.kind, "cover");
  assert.equal(cover.reportId, "013");
});

test("cloud metadata without a manifest row falls back to filename and upload date", () => {
  const meta = cloudDocumentMetadata({ path: "output/cv-discovery.pdf", updated_at: "2026-10-18T05:00:00Z" }, "");
  assert.deepEqual(meta, { kind: "cv", reportId: null, date: "2026-10-18", format: "pdf" });
});
