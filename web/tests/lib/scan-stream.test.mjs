import test from 'node:test';
import assert from 'node:assert/strict';
import { formatLiveOfferLine } from '../../../scan-ats-full.mjs';
import { parseStreamOffer } from '../../src/lib/core/scan-offer.mjs';

const job = {company:'Fixture', title:'AI Engineer',url:'https://jobs.example.test/1',location:'Singapore',postedAt:'2026-10-11'};
test('v1.36 canonical live offers render before the final scanner payload',()=>{
  const offer = parseStreamOffer(formatLiveOfferLine(job,'greenhouse-full'),'greenhouse',['AI']);
  assert.equal(offer.url,job.url);
  assert.equal(offer.ats,'greenhouse');
  assert.equal(offer.matchedKeyword,'AI');
});
test('legacy live offers remain supported',()=>{
  assert.equal(parseStreamOffer('@@CAREER_OPS_OFFER@@'+JSON.stringify(job),'lever').url,job.url);
});
test('non-offer logs and malformed payloads cannot become result cards',()=>{
  for(const line of ['progress: 3/10','{bad','{"kind":"log"}','@@CAREER_OPS_OFFER@@{}']) assert.equal(parseStreamOffer(line,'lever'),null);
});
