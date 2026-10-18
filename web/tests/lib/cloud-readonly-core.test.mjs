import assert from "node:assert/strict";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runReadonlyCore, safeSnapshotPath } from "../../src/lib/workspace/readonly-core.mjs";

test("cloud snapshots reject escapes and writable engines", async () => {
  for (const value of ["../cv.md", "/cv.md", "C:/cv.md", "data/../cv.md", "data\\cv.md", "data//cv.md", "a\0b"])
    assert.equal(safeSnapshotPath(value), false, value);
  assert.equal(safeSnapshotPath("data/applications.md"), true);
  await assert.rejects(runReadonlyCore({ files: new Map(), codeRoot: ".", script: "set-status" }), /Unsupported/);
});

test("canonical stats read only the supplied cloud tracker, never local applications", async () => {
  const codeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const tracker = "| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|---|---|---|---|---|---|---|---|\n| 1 | 2026-10-01 | Fixture Cloud | Engineer | 4/5 | Applied | — | — | — |\n";
  const files = new Map([["data/applications.md", tracker]]);
  const result = await runReadonlyCore({ files, codeRoot, script: "stats" });
  assert.equal(result.failed, false);
  assert.equal(result.data.tracker.total, 1);
  assert.equal(files.get("data/applications.md"), tracker);
});
