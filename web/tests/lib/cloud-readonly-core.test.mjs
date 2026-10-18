import assert from "node:assert/strict";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runReadonlyCore, safeSnapshotPath, snapshotEnv } from "../../src/lib/workspace/readonly-core.mjs";

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

test("snapshot env drops inherited CAREER_OPS overrides so no local file leaks into cloud reads", () => {
  const base = { PATH: "/bin", CAREER_OPS_PROFILE: "C:/local/profile.yml", CAREER_OPS_PORTALS: "C:/local/portals.yml",
    CAREER_OPS_REPORTS_DIR: "C:/local/reports", CAREER_OPS_CV: "C:/local/cv.md", CAREER_OPS_ROOT: "C:/local" };
  const env = snapshotEnv("/tmp/snap", base);
  assert.equal(env.PATH, "/bin");
  for (const key of ["CAREER_OPS_PROFILE", "CAREER_OPS_PORTALS", "CAREER_OPS_REPORTS_DIR", "CAREER_OPS_CV"])
    assert.equal(env[key], undefined, key);
  assert.equal(env.CAREER_OPS_ROOT, "/tmp/snap");
  assert.equal(env.CAREER_OPS_DATA_DIR, "/tmp/snap");
  assert.equal(env.CAREER_OPS_TRACKER, path.join("/tmp/snap", "data", "applications.md"));
});
