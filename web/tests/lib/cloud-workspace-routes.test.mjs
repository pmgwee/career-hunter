import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "node:module";
import * as yaml from "js-yaml";
import "../helpers/web-ts-alias-loader.mjs";

// Replace only the authenticated storage transport. Real route validation and
// merging execute without credentials, a network, or a personal data root.
register(`data:text/javascript,${encodeURIComponent(`
  const modules = {
    '@/lib/workspace/snapshot': 'export async function loadCareerWorkspace(){if(globalThis.cloudRouteFixture.fail)throw new Error("unavailable");return globalThis.cloudRouteFixture.snapshot}',
    '@/lib/workspace/write-files': 'export async function writeWorkspaceFiles(snapshot,files){globalThis.cloudRouteFixture.writes.push(...files)}',
    '@/lib/supabase/server': 'export async function createClient(){return globalThis.cloudRouteFixture.supabase}'
  };
  export async function resolve(name, context, next) {
    if (name === 'server-only') return {url:'data:text/javascript,export {}',shortCircuit:true};
    if (name === 'next/server') return next('next/server.js',context);
    if (modules[name]) return {url:'data:text/javascript,'+encodeURIComponent(modules[name]),shortCircuit:true};
    return next(name,context);
  }
`)}`, import.meta.url);
const { GET: doctor } = await import("../../src/app/api/doctor/route.ts");
const { POST: cadence } = await import("../../src/app/api/followups/cadence/route.ts");
const { POST: saveCv, GET: readCv } = await import("../../src/app/api/cv/route.ts");
const { loadFollowupsResponse } = await import("../../src/lib/followups-cloud.ts");
const { GET: readDocuments } = await import("../../src/app/api/documents/route.ts");
const { POST: saveStatus } = await import("../../src/app/api/status/route.ts");
function fixture(profile) {
  globalThis.cloudRouteFixture = { fail:false, writes:[], snapshot:{ workspaceId:"fixture", ownerId:"fixture",
    onboardingNeeded:true, missing:["cv.md"], files:new Map(profile === undefined ? [] : [["config/profile.yml",profile]]) } };
  return globalThis.cloudRouteFixture;
}
const request = (body) => new Request("https://fixture.invalid/api/x", {method:"POST",body:JSON.stringify(body)});
test("cloud doctor uses the authenticated prerequisite verdict and fails closed", async () => {
  const state=fixture();
  assert.deepEqual(await (await doctor()).json(), {available:true,onboardingNeeded:true,missing:["cv.md"],warnings:[]});
  state.fail=true;
  assert.equal((await (await doctor()).json()).available,false);
});
test("cloud cadence refuses malformed existing profiles without a write", async () => {
  for(const profile of ["null\n","- item\n","42\n","true\n","text\n","# empty\n","candidate: [broken\n"]) {
    const state=fixture(profile);
    assert.equal((await cadence(request({applied_first_days:9}))).status,409,profile);
    assert.equal(state.writes.length,0);
  }
});
test("cloud cadence preserves unrelated profile fields when saving overrides", async () => {
  const state=fixture("candidate:\n  name: Fixture\nfollowup_cadence:\n  applied_max_followups: 3\n");
  assert.equal((await cadence(request({applied_first_days:9}))).status,200);
  assert.equal(state.writes.length,1);
  assert.deepEqual(yaml.load(state.writes[0].content),{candidate:{name:"Fixture"},followup_cadence:{applied_first_days:9,applied_max_followups:3}});
});
test("cloud CV rejects non-object JSON before touching workspace data", async () => {
  const state=fixture();
  for(const body of [null,[],1,"text"]) assert.equal((await saveCv(request(body))).status,400);
  assert.equal(state.writes.length,0);
});
test("cloud status rejects non-object JSON without a tracker write", async () => {
  const state=fixture();
  for(const body of [null,[],1,"text"]) assert.equal((await saveStatus(request(body))).status,400);
  assert.equal(state.writes.length,0);
});
test("cloud CV distinguishes unavailable storage from a missing CV", async () => {
  const state=fixture();
  assert.deepEqual(await (await readCv()).json(),{content:"",exists:false});
  state.fail=true;
  assert.equal((await readCv()).status,503);
  assert.equal(state.writes.length,0);
});
test("cloud follow-up preview retains upcoming rows from the canonical engine", async () => {
  const state=fixture("candidate:\n  name: Fixture\n");
  const today=new Date().toISOString().slice(0,10);
  state.snapshot.files.set("data/applications.md", `# Applications\n\n| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|------|---------|------|-------|--------|-----|--------|-------|\n| 1 | ${today} | Northwind | Engineer | 4/5 | Applied | — | — | fixture |\n`);
  const response=await loadFollowupsResponse();
  assert.equal(response.available,true);
  assert.equal(response.entries.length,1);
  assert.equal(response.upcoming.length,1);
  assert.equal(state.writes.length,0);
});
test("cloud documents scope queries to the authenticated workspace and private PDF owner", async () => {
  const state=fixture();
  const filters=[];
  const downloads=[];
  const id="11111111-2222-3333-4444-555555555555";
  let row={id,path:"output/fixture-cv.pdf",object_name:"fixture/private.pdf",mime_type:"application/pdf",updated_at:"2026-10-18T00:00:00Z"};
  const query={select(){return this},eq(key,value){filters.push([key,value]);return this},is(key,value){filters.push([key,value]);return this},async single(){return {data:row,error:null}},then(resolve){resolve({data:[row],error:null})}};
  state.supabase={from(table){assert.equal(table,"career_artifacts");return query},storage:{from(bucket){assert.equal(bucket,"career-artifacts");return {async download(name){downloads.push(name);return {data:new Blob(["fixture pdf"]),error:null}}}}}};
  const req=()=>new Request(`https://fixture.invalid/api/documents?id=${id}`);
  const response=await readDocuments(req());
  assert.equal(response.status,200);
  assert.equal(response.headers.get("cache-control"),"private, no-store");
  assert.ok(filters.some(([key,value])=>key==="workspace_id"&&value==="fixture"));
  assert.ok(filters.some(([key,value])=>key==="owner_id"&&value==="fixture"));
  assert.deepEqual(downloads,["fixture/private.pdf"]);
  row={...row,object_name:"another-owner/private.pdf"};
  assert.equal((await readDocuments(req())).status,404);
  row={...row,object_name:"fixture/private.pdf",mime_type:"text/html"};
  assert.equal((await readDocuments(req())).status,404);
  assert.equal(downloads.length,1);
  assert.equal(state.writes.length,0);
});
test("cloud document list classifies from the synced PDF manifest, not substrings", async () => {
  const state=fixture();
  state.snapshot.files.set("data/pdf-index.tsv","021\toutput/cv-discovery.pdf\t\tpdf\t2026-09-30\tcv\n");
  const rows=[{id:"a",path:"output/cv-discovery.pdf",object_name:"fixture/a.pdf",mime_type:"application/pdf",updated_at:"2026-10-18T00:00:00Z"},
    {id:"b",path:"output/recovery-notes.pdf",object_name:"fixture/b.pdf",mime_type:"application/pdf",updated_at:"2026-10-17T00:00:00Z"}];
  const query={select(){return this},eq(){return this},is(){return this},then(resolve){resolve({data:rows,error:null})}};
  state.supabase={from(){return query}};
  const list=await (await readDocuments(new Request("https://fixture.invalid/api/documents"))).json();
  assert.deepEqual(list.map(({kind,reportId,date})=>({kind,reportId,date})),
    [{kind:"cv",reportId:"021",date:"2026-09-30"},{kind:"unknown",reportId:null,date:"2026-10-17"}]);
  assert.equal(state.writes.length,0);
});
test("cloud follow-up toggle writes follow_ups.enabled and reports it back", async () => {
  const { GET: readCadence } = await import("../../src/app/api/followups/cadence/route.ts");
  const state=fixture("candidate:\n  name: Fixture\n");
  assert.equal((await readCadence()).status,200);
  assert.equal((await (await readCadence()).json()).enabled,true);
  assert.equal((await cadence(request({enabled:"no"}))).status,400);
  assert.equal(state.writes.length,0);
  assert.equal((await cadence(request({enabled:false}))).status,200);
  assert.deepEqual(yaml.load(state.writes[0].content),{candidate:{name:"Fixture"},follow_ups:{enabled:false}});
  state.snapshot.files.set("config/profile.yml",state.writes[0].content);
  assert.equal((await (await readCadence()).json()).enabled,false);
});
