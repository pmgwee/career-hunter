import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { companyIdentity, companyDomain } from "../../src/lib/company.ts";
import { parseApplications } from "../../src/lib/tracker-table.mjs";

test("confidential employer uses its confirmed recruiter for display and logo", () => {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const md = [
    "| # | Date | Company | Via | Role | Score | Status | PDF | Report | Notes |",
    "|---|---|---|---|---|---|---|---|---|---|",
    "| 94 | 2026-09-30 | ? | Ambition | AI Engineer (GenAI + Python) | 4.5/5 | Applied | ✅ | [095](../reports/095-confidential-ambition-2026-09-30.md) | Client undisclosed |",
  ].join("\n");
  const [app] = parseApplications(md, root);
  assert.equal(app.via, "Ambition");
  assert.deepEqual(companyIdentity(app.company, app.via), {
    displayName: "Confidential (via Ambition)", logoName: "Ambition",
  });
  assert.equal(app.company, "?");
  assert.equal(app.status, "Applied");
  assert.equal(app.n, "94");
});

test("a disclosed employer keeps its identity even when an agency is involved", () => {
  assert.deepEqual(companyIdentity("AMD", "Ambition"), { displayName: "AMD", logoName: "AMD" });
});

test("missing recruiter placeholders are not presented as agency names", () => {
  for (const via of [null, undefined, "", " ", "?", "-", "—"]) {
    assert.deepEqual(companyIdentity("?", via), { displayName: "Confidential", logoName: "Confidential" });
  }
});

test("identity trims names and recognizes a confidential client label", () => {
  assert.deepEqual(companyIdentity(" Confidential ", " Ambition "), {
    displayName: "Confidential (via Ambition)", logoName: "Ambition",
  });
});

test("Ambition resolves to its verified Malaysian recruitment domain", () => {
  assert.equal(companyDomain("Ambition"), "ambition.com.my");
});
