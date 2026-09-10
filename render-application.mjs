#!/usr/bin/env node

// Tailored-application renderer (fork-local — see config/local-paths.txt).
//
//   node render-application.mjs cv    <payload.json> <output.html>
//   node render-application.mjs cover <payload.json> <output.html>
//
// Why this exists rather than a section partial for build-cv-html.mjs:
// that renderer collapses a project's `bullets` array into one joined
// paragraph before any partial sees it (`bullets.filter(Boolean).join(' ')`),
// and its section list is fixed, so neither per-bullet projects nor a
// Volunteering section can be expressed as a partial. Both are requirements of
// the house layout, so the rendering is owned here instead of post-processing
// generated HTML — a regex reaching into another script's output would break
// silently the first time upstream changed a class name.
//
// Contract with the rest of the pipeline is unchanged: this emits HTML only,
// and generate-pdf.mjs stays the single PDF renderer.
//
// The payload is written by the agent after tailoring cv.md against a specific
// job description. This script does not read cv.md, does not tailor, and does
// not invent: whatever the payload says is what is rendered.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = {
  cv: join(__dirname, 'templates-gpm', 'cv-tailored.html'),
  cover: join(__dirname, 'templates-gpm', 'cover-traditional.html'),
};
const PAGE_WIDTHS = { letter: '8.5in', a4: '210mm' };
const PLACEHOLDER_RE = /\{\{[A-Z_]+\}\}/g;

// Section order is a tailoring decision (modes/_profile.md → "Section order by
// role type"), so it travels in the payload rather than being frozen here.
const DEFAULT_CV_ORDER = [
  'summary', 'skills', 'projects', 'experience', 'education', 'awards', 'volunteering',
];
const DEFAULT_TITLES = {
  summary: 'Professional Summary',
  skills: 'Skills',
  projects: 'Projects',
  experience: 'Work Experience',
  education: 'Education',
  awards: 'Awards & Honors',
  volunteering: 'Volunteering',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only http(s) and mailto survive. Anything else (javascript:, data:) renders as
// plain text instead of a link — a CV is a document that gets forwarded around,
// and a payload is just a file on disk that something else may have written.
function safeUrl(raw) {
  if (!raw) return '';
  const value = String(raw).trim();
  if (!/^(https?:\/\/|mailto:)/i.test(value)) return '';
  return escapeHtml(value);
}

// `replace` with a string argument interprets $&, $', $` and $$ in the
// replacement. Escaped user text can still contain those sequences, which would
// splice part of the template into the document. A replacer function's return
// value is never scanned, so every fill below goes through one.
function fill(template, key, value) {
  return template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), () => value);
}

function fillAll(template, substitutions) {
  let out = template;
  for (const [key, value] of Object.entries(substitutions)) out = fill(out, key, value);
  const unresolved = out.match(PLACEHOLDER_RE);
  if (unresolved) {
    throw new Error(`Unresolved placeholders: ${[...new Set(unresolved)].join(', ')}`);
  }
  return out;
}

// ── CV sections ─────────────────────────────────────────────────────────────

function buildContactRow(candidate = {}) {
  const items = [];
  if (candidate.phone) {
    items.push(`<a href="tel:${escapeHtml(candidate.phone)}">${escapeHtml(candidate.phone)}</a>`);
  }
  if (candidate.email) {
    items.push(`<a href="mailto:${escapeHtml(candidate.email)}">${escapeHtml(candidate.email)}</a>`);
  }
  for (const key of ['linkedin', 'github', 'portfolio']) {
    const link = candidate[key];
    const href = link && safeUrl(link.url);
    if (href) items.push(`<a href="${href}">${escapeHtml(link.display || link.url)}</a>`);
  }
  // Location is deliberately the one non-link item, so it reads as a fact about
  // the candidate rather than something to click.
  if (candidate.location) items.push(`<span>${escapeHtml(candidate.location)}</span>`);

  const sep = '\n      <span class="separator">|</span>\n      ';
  return `<div class="contact-row">\n      ${items.join(sep)}\n    </div>`;
}

function buildSummary(summary) {
  if (!summary) return '';
  return `<div class="summary-text">${escapeHtml(summary)}</div>`;
}

function buildSkills(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return '';
  return categories.filter(Boolean).map(c =>
    `<div class="skill-item"><span class="skill-category">${escapeHtml(c.category)}:</span> ${escapeHtml(c.items)}</div>`
  ).join('\n    ');
}

function buildProjects(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return entries.filter(Boolean).map(e => {
    const url = safeUrl(e.url);
    const name = escapeHtml(e.name || '');
    const title = url ? `<a href="${url}">${name}</a>` : name;
    const bullets = Array.isArray(e.bullets) ? e.bullets.filter(Boolean) : [];
    const list = bullets.length
      ? `\n      <ul class="project-bullets">\n${bullets.map(b => `        <li>${escapeHtml(b)}</li>`).join('\n')}\n      </ul>`
      : '';
    const tech = e.tech ? `\n      <div class="project-tech">${escapeHtml(e.tech)}</div>` : '';
    return `<div class="project">
      <div class="project-title">${title}</div>${list}${tech}
    </div>`;
  }).join('\n    ');
}

function buildExperience(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return entries.filter(Boolean).map(e => {
    const bullets = Array.isArray(e.bullets) ? e.bullets.filter(Boolean) : [];
    const list = bullets.length
      ? `\n      <ul>\n${bullets.map(b => `        <li>${escapeHtml(b)}</li>`).join('\n')}\n      </ul>`
      : '';
    const location = e.location ? `\n      <div class="job-location">${escapeHtml(e.location)}</div>` : '';
    return `<div class="job">
      <div class="job-header">
        <span class="job-company">${escapeHtml(e.company || '')}</span>
        <span class="job-period">${escapeHtml(e.dates || '')}</span>
      </div>
      <div class="job-role">${escapeHtml(e.role || '')}</div>${location}${list}
    </div>`;
  }).join('\n    ');
}

function buildEducation(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return entries.filter(Boolean).map(e => {
    const org = e.org ? ` <span class="edu-org">${escapeHtml(e.org)}</span>` : '';
    // CGPA and Dean's List belong on the Education line (modes/_profile.md), but
    // appending them to the degree title pushes the row to two lines and strands
    // the university on the wrap. They get their own sub-line instead.
    const detail = e.detail ? `\n      <div class="edu-desc">${escapeHtml(e.detail)}</div>` : '';
    return `<div class="edu-item">
      <div class="edu-header">
        <span class="edu-title">${escapeHtml(e.title || '')}${org}</span>
        <span class="edu-year">${escapeHtml(e.year || '')}</span>
      </div>${detail}
    </div>`;
  }).join('\n    ');
}

// The placement ("Champion", "Second Prize", "5th Place & Best Business Idea
// Award") is the scannable part of an award row, so it is bolded. Splitting on
// the first " - " rather than matching a keyword list means a new award needs no
// change here; a title with no separator simply renders unbolded.
function buildAwards(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  const rows = entries.filter(Boolean).map(e => {
    const raw = String(e.title || '');
    const idx = raw.indexOf(' - ');
    const title = idx > 0
      ? `<strong>${escapeHtml(raw.slice(0, idx))}</strong>${escapeHtml(raw.slice(idx))}`
      : escapeHtml(raw);
    return `<div class="award-item">
      <span class="award-title">${title}</span>
      <span class="award-org">${escapeHtml(e.org || '')}</span>
      <span class="award-year">${escapeHtml(e.year || '')}</span>
    </div>`;
  }).join('\n    ');
  return `<div class="award-table">${rows}</div>`;
}

function buildVolunteering(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return entries.filter(Boolean).map(e => {
    const bullets = Array.isArray(e.bullets) ? e.bullets.filter(Boolean) : [];
    const list = bullets.length
      ? `\n      <ul>\n${bullets.map(b => `        <li>${escapeHtml(b)}</li>`).join('\n')}\n      </ul>`
      : '';
    return `<div class="job volunteer-item">
      <div class="job-header">
        <span class="volunteer-title">${escapeHtml(e.title || '')}</span>
        <span class="job-period">${escapeHtml(e.dates || '')}</span>
      </div>${list}
    </div>`;
  }).join('\n    ');
}

const CV_BUILDERS = {
  summary: p => buildSummary(p.summary),
  skills: p => buildSkills(p.skills),
  projects: p => buildProjects(p.projects),
  experience: p => buildExperience(p.experience),
  education: p => buildEducation(p.education),
  awards: p => buildAwards(p.awards),
  volunteering: p => buildVolunteering(p.volunteering),
};

function renderCv(payload, template) {
  const order = Array.isArray(payload.section_order) && payload.section_order.length
    ? payload.section_order
    : DEFAULT_CV_ORDER;
  const titles = { ...DEFAULT_TITLES, ...(payload.sections || {}) };

  const rendered = [];
  for (const name of order) {
    const build = CV_BUILDERS[name];
    if (!build) throw new Error(`Unknown CV section "${name}" in section_order`);
    const body = build(payload);
    // An empty section leaves no bare heading behind — a "Certifications"
    // header over nothing reads as a gap in the candidate, not a gap in the data.
    if (!body) continue;
    rendered.push(`  <!-- ${name.toUpperCase()} -->
  <div class="section">
    <div class="section-title">${escapeHtml(titles[name])}</div>
    ${body}
  </div>`);
  }

  const candidate = payload.candidate || {};
  return {
    html: fillAll(template, {
      LANG: escapeHtml(payload.lang || 'en'),
      PAGE_WIDTH: PAGE_WIDTHS[payload.page_format] || PAGE_WIDTHS.a4,
      NAME: escapeHtml(candidate.name || ''),
      CONTACT_ROW: buildContactRow(candidate),
      SECTIONS: rendered.join('\n\n'),
    }),
    counts: {
      sections: rendered.length,
      skillCategories: (payload.skills || []).length,
      projects: (payload.projects || []).length,
      projectBullets: (payload.projects || []).reduce((n, p) => n + (p.bullets || []).length, 0),
      experience: (payload.experience || []).length,
      education: (payload.education || []).length,
      awards: (payload.awards || []).length,
      volunteering: (payload.volunteering || []).length,
    },
  };
}

// ── Cover letter ────────────────────────────────────────────────────────────

function renderCover(payload, template) {
  const candidate = payload.candidate || {};
  const recipient = payload.recipient || {};

  const contactItems = [];
  for (const key of ['portfolio', 'linkedin', 'github']) {
    const link = candidate[key];
    const href = link && safeUrl(link.url);
    if (href) contactItems.push(`<a href="${href}">${escapeHtml(link.display || link.url)}</a>`);
  }
  if (candidate.email) {
    contactItems.push(`<a href="mailto:${escapeHtml(candidate.email)}">${escapeHtml(candidate.email_display || candidate.email)}</a>`);
  }
  if (candidate.phone) contactItems.push(escapeHtml(candidate.phone));
  const contactLine = contactItems.length
    ? `<div class="contact">\n        ${contactItems.join(' |\n        ')}\n      </div>`
    : '';

  // The employer address is a per-application field, never a stored default:
  // a city-only line where a full office address was available reads as a mail
  // merge. Lines arrive as an array so the block wraps where the sender chose.
  const addressLines = Array.isArray(recipient.address) ? recipient.address.filter(Boolean) : [];
  const recipientBlock = [
    `<strong>${escapeHtml(recipient.attention || 'Hiring Team')}</strong>`,
    ...(recipient.company ? [escapeHtml(recipient.company)] : []),
    ...addressLines.map(escapeHtml),
  ].join('<br>\n        ');

  const paragraphs = Array.isArray(payload.paragraphs) ? payload.paragraphs.filter(Boolean) : [];
  if (paragraphs.length === 0) throw new Error('Cover payload has no paragraphs');

  // House format: the opening paragraph carries no number, the rest are 2. 3. 4.
  const body = paragraphs.map((text, i) => (
    i === 0
      ? `    <p>${escapeHtml(text)}</p>`
      : `    <p class="numbered"><span class="number">${i + 1}.</span><span>${escapeHtml(text)}</span></p>`
  )).join('\n\n');

  const credentials = (payload.credentials || []).filter(Boolean).map(escapeHtml).join('<br>\n      ');
  const wordCount = paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length;

  return {
    html: fillAll(template, {
      LANG: escapeHtml(payload.lang || 'en'),
      NAME: escapeHtml(candidate.name || ''),
      NAME_UPPER: escapeHtml((candidate.name || '').toUpperCase()),
      SENDER_ADDRESS: escapeHtml(candidate.address || ''),
      CONTACT_LINE: contactLine,
      RECIPIENT_BLOCK: recipientBlock,
      DATELINE: escapeHtml(payload.dateline || ''),
      GREETING: escapeHtml(payload.greeting || 'Dear Sir / Madam,'),
      SUBJECT: escapeHtml(payload.subject || ''),
      PARAGRAPHS: body,
      CLOSING: escapeHtml(payload.closing || 'Thank you in advance for your kind consideration.'),
      SIGNOFF: escapeHtml(payload.signoff || 'Sincerely,'),
      CREDENTIALS: credentials,
    }),
    counts: { paragraphs: paragraphs.length, bodyWords: wordCount },
  };
}

// ── Entry point ─────────────────────────────────────────────────────────────

function main() {
  const [kind, input, output] = process.argv.slice(2);

  if (!kind || !input || !output || !['cv', 'cover'].includes(kind)) {
    console.error('Usage:');
    console.error('  node render-application.mjs cv    <payload.json> <output.html>');
    console.error('  node render-application.mjs cover <payload.json> <output.html>');
    process.exit(1);
  }

  const templatePath = TEMPLATES[kind];
  if (!existsSync(templatePath)) throw new Error(`Template not found: ${templatePath}`);

  const payload = JSON.parse(readFileSync(resolve(input), 'utf-8'));
  const template = readFileSync(templatePath, 'utf-8');
  const { html, counts } = kind === 'cv'
    ? renderCv(payload, template)
    : renderCover(payload, template);

  const absOutput = resolve(output);
  const outDir = dirname(absOutput);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(absOutput, html, 'utf-8');

  const report = { kind, template: templatePath, file: absOutput, counts, valid: true };

  // The 350-420 body-word rule is a house rule (modes/_profile.md), so this
  // reports the count rather than enforcing it — a deliberate 340-word letter is
  // the author's call, but silently shipping a 700-word one is the failure mode
  // the rule exists for.
  if (kind === 'cover' && (counts.bodyWords < 350 || counts.bodyWords > 420)) {
    report.warning = `Body is ${counts.bodyWords} words; house target is 350-420.`;
  }

  console.log(JSON.stringify(report, null, 2));
}

main();
