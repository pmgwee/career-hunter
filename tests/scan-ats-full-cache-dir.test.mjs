import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('reverse scanner resolves its checkpoint under the supplied cache root', () => {
  const cacheRoot = mkdtempSync(path.join(os.tmpdir(), 'career-ops-cache-test-'));
  try {
    const checkpoint = { version: 1, current: null, marker: 'temp-cache' };
    writeFileSync(path.join(cacheRoot, 'ats-full-checkpoint.json'), JSON.stringify(checkpoint));
    const output = execFileSync(process.execPath, [
      '--input-type=module',
      '-e',
      'import { loadCheckpoint } from "./scan-ats-full.mjs"; console.log(JSON.stringify(loadCheckpoint()));',
    ], {
      cwd: root,
      env: { ...process.env, CAREER_OPS_SCAN_CACHE_DIR: cacheRoot },
      encoding: 'utf8',
      timeout: 10_000,
    });
    assert.deepEqual(JSON.parse(output), checkpoint);
  } finally {
    rmSync(cacheRoot, { recursive: true, force: true });
  }
});
