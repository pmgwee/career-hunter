import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeScanOffer } from '../../src/lib/core/scan-offer.mjs';

test('normalizes a non-string posting date instead of crashing result sorting', () => {
  const offer = normalizeScanOffer({
    url: 'https://example.com/job', company: 'Example', title: 'Data Engineer',
    postedAt: 1789999999999, location: { city: 'Kuala Lumpur' }, source: 'greenhouse-full',
  }, 'greenhouse', ['Data']);
  assert.equal(offer.postedAt, '');
  assert.equal(offer.location, '');
  assert.equal(offer.matchedKeyword, 'Data');
});

test('keeps valid ISO posting dates and rejects malformed offers', () => {
  assert.equal(normalizeScanOffer({
    url: 'https://example.com/job', company: 'Example', title: 'Engineer',
    postedAt: '2026-09-23T08:00:00Z',
  }, 'ashby').postedAt, '2026-09-23');
  assert.equal(normalizeScanOffer({ company: 'Example', title: 'Engineer' }, 'ashby'), null);
});
