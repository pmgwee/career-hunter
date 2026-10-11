import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCanonicalStates } from '../tracker-utils.mjs';
import { analyzeFromContent, computeNextFollowupDate, computeUrgency } from '../followup-cadence.mjs';
import { computeTrackerStats, computeFunnel, computeFunnelWithHistory } from '../stats.mjs';
import { parseStatusLog, foldObservations, computeVelocity } from '../funnel-velocity.mjs';

const tracker = [
  '| # | Date | Company | Role | Score | Status | PDF | Report | Notes |',
  '|---|------|---------|------|-------|--------|-----|--------|-------|',
  '| 1 | 2026-06-01 | Example Corp | Engineer | 4/5 | Assessment | — | — | Applied 2026-06-01 |',
].join('\n');
const statesPath = new URL('../templates/states.yml', import.meta.url);

test('release integration retains the customized Assessment state and aliases', () => {
  const state = loadCanonicalStates(statesPath).find(s => s.label === 'Assessment');
  assert.ok(state);
  assert.ok(state.aliases.includes('screening'));
});

test('Assessment applications stay visible in follow-ups with responded cadence', () => {
  assert.equal(analyzeFromContent(tracker).entries.length, 1);
  assert.equal(computeUrgency('assessment', 5, null, 0), computeUrgency('responded', 5, null, 0));
  assert.equal(computeNextFollowupDate('assessment', '2026-06-01', null, 0), computeNextFollowupDate('responded', '2026-06-01', null, 0));
});

test('Assessment counts as pursued and responded, not as an interview', () => {
  const stats = computeTrackerStats(tracker);
  assert.equal(stats.byStatus.Assessment, 1);
  assert.equal(stats.activeApps, 1);
  assert.equal(stats.avgScoreApplied, 4);
  const snapshot = computeFunnel(stats.byStatus);
  const history = computeFunnelWithHistory(new Map([[1, 'Assessment']]), []);
  for (const result of [snapshot, history]) {
    assert.equal(result.everApplied, 1);
    assert.equal(result.everResponded, 1);
    assert.equal(result.everInterview, 0);
  }
});

test('Assessment velocity retains both hops without double counting the direct hop', () => {
  const log = [
    '1\t2026-06-01\tApplied\tResponded\tset-status\t',
    '1\t2026-06-04\tResponded\tAssessment\tset-status\t',
    '1\t2026-06-09\tAssessment\tInterview\tset-status\t',
  ].join('\n');
  const parsed = parseStatusLog(log, loadCanonicalStates(statesPath));
  assert.equal(parsed.unparseable.length, 0);
  const velocity = computeVelocity(foldObservations(parsed.observations), '2026-06-20');
  assert.equal(velocity.respondedToAssessment.n, 1);
  assert.equal(velocity.assessmentToInterview.n, 1);
  assert.equal(velocity.respondedToInterview.n, 0);
});
