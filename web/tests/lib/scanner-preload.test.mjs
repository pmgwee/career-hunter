import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

test("root scanner can resolve web-installed YAML in an isolated deployment", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "career-ops-scanner-deps-"));
  try {
    const probe = path.join(dir, "probe.mjs");
    writeFileSync(probe, 'import * as yaml from "js-yaml"; console.log(JSON.stringify(yaml.load("title_filter: {}")));\n');
    const preload = new URL("../../src/lib/core/scanner-preload.mjs", import.meta.url).href;
    const stdout = execFileSync(process.execPath, ["--import", preload, probe], { encoding: "utf8", timeout: 10_000 });
    assert.equal(stdout.trim(), '{"title_filter":{}}');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
