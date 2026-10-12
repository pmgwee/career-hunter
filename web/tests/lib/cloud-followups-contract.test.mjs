import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyzeFromContent, parseSelfIdentitiesContent} from '../../../followup-cadence.mjs';

const date = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
const tracker = `| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | ${date} | Example One | Engineer | 4/5 | Applied | — | — | fixture |
| 2 | ${date} | Example Two | Engineer | 4/5 | Assessment | — | — | fixture |
| 3 | ${date} | Example Three | Engineer | 4/5 | Hired | — | — | fixture |`;

test('cloud cadence uses the requesting workspace profile without leaking across requests', () => {
  const slow = {profileContent:'followup_cadence:\n  applied_first_days: 30\n', resolveReportPath:()=>null};
  const fast = {profileContent:'followup_cadence:\n  applied_first_days: 1\n', resolveReportPath:()=>null};
  const first = analyzeFromContent(tracker, '', slow);
  const second = analyzeFromContent(tracker, '', fast);
  const third = analyzeFromContent(tracker, '', slow);
  assert.equal(first.cadenceConfig.applied_first, 30);
  assert.equal(second.cadenceConfig.applied_first, 1);
  assert.deepEqual(third, first);
  assert.equal(first.metadata.totalTracked, 3);
  assert.equal(first.metadata.actionable, 2, 'Assessment stays active; Hired is terminal');
  assert.ok(second.metadata.overdue > first.metadata.overdue);
});

test('in-memory candidate identities remain scoped to each workspace', () => {
  const one = parseSelfIdentitiesContent('candidate:\n  email: one@example.test\n');
  const two = parseSelfIdentitiesContent('candidate:\n  email: two@example.test\n');
  assert.deepEqual([...one], ['one@example.test']);
  assert.deepEqual([...two], ['two@example.test']);
  assert.deepEqual([...parseSelfIdentitiesContent('')], []);
});
