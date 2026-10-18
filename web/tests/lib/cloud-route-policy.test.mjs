import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { requiresLocalWorker, rejectsCrossOriginWrite } from "../../src/lib/workspace/cloud-route-policy.mjs";
test("cloud writes cannot silently fall through to ephemeral local storage", () => {
  for(const route of ["/api/cv-studio/42","/api/scheduled-jobs/1/run","/api/assistant/chats","/api/profile","/api/memory","/api/portals","/api/run","/api/runs/save"]) assert.equal(requiresLocalWorker(route),true);
  for(const route of ["/api/cv","/api/status","/api/followups/log","/api/sync/push"]) assert.equal(requiresLocalWorker(route),false);
});
test("cloud mutation protection permits same-origin and scoped CLI requests", () => {
  const base={method:"POST",requestOrigin:"https://fixture.vercel.app",origin:null,site:null};
  assert.equal(rejectsCrossOriginWrite(base),false);
  assert.equal(rejectsCrossOriginWrite({...base,origin:base.requestOrigin,site:"same-origin"}),false);
  assert.equal(rejectsCrossOriginWrite({...base,origin:"https://evil.invalid"}),true);
  assert.equal(rejectsCrossOriginWrite({...base,site:"cross-site"}),true);
});
test("cloud release routes stay within the project's Hobby duration limit", () => {
  for(const route of ["run","apply/prefill"]) {
    const source=fs.readFileSync(new URL(`../../src/app/api/${route}/route.ts`,import.meta.url),"utf8");
    assert.ok(Number(source.match(/export const maxDuration = (\d+)/)?.[1])<=300,route);
  }
});
