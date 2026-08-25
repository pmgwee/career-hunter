# STAR+R Story Bank — Gwee Per Ming

Master stories, reusable across behavioural interviews. Seeded from the cover-letter archive
(Aug 2026). **R = Reflection** — the lesson. That is the part that separates a graduate answer
from a hire-worthy one.

Every fact here traces to `cv.md`. Add new stories after each real interview via
`/career-ops interview/debrief`.

---

## Story 1 — "The specification that needed domain knowledge first"
**Tags:** stakeholder management · requirements · regulated data · communication
**Answers:** *Tell me about working with a difficult requirement · How do you handle ambiguity ·
Tell me about working with non-engineers · Describe a time you had to learn a domain fast*

- **S** — Intern at iFAST Capital, sitting between a project director and a delivery team,
  on change requests from a major Malaysian bank.
- **T** — Translate those change requests into technical specifications covering automation
  workflow, data specifications, batch-ETL pipelines and UAT datasets.
- **A** — Worked the requirement backwards from the business intent rather than the ticket
  text; followed each spec through to release alongside 14 developers and 4 project directors
  across monthly sprints, supporting CI/CD pipelines, change request management and
  production releases.
- **R (result)** — Specs delivered end to end into production for business-critical fintech
  systems, internal and external.
- **R (reflection)** — *"A specification is only as good as the domain knowledge behind it.
  Business requirements come first and the technical specification follows, never the other
  way round."*

---

## Story 2 — "Correct wasn't good enough"
**Tags:** performance · SQL · scale · compliance · ownership
**Answers:** *Tell me about optimising something · A time you went beyond the requirement ·
Working with sensitive data · Your biggest technical contribution*

- **S** — iFAST needed an automated compliance job covering sensitive customer data across
  millions of account records.
- **T** — Architect it, and make it actually usable in a production window.
- **A** — Built the job, then optimised the complex SQL behind it — reducing database calls
  and improving execution efficiency across ~100,000 affected rows.
- **R (result)** — The job ran fast enough to be operationally usable, not merely correct.
- **R (reflection)** — *"Sensitive customer records carry handling rules before they carry
  business value."* Compliance work has a second, invisible requirements set.

---

## Story 3 — "The hooks that failed silently" ⭐ strongest story
**Tags:** debugging · observability · evaluation · AI-native development · intellectual honesty
**Answers:** *Hardest technical problem · A time you were wrong · How do you know your AI
system works · Tell me about a failure · How do you evaluate an LLM system*

- **S** — Building a persistent second-brain memory engine so coding agents stop losing
  context across tools, projects and sessions. Integrated with Claude Code and Codex via
  their native lifecycle hooks.
- **T** — Make relevant historical knowledge retrieve and inject automatically at each stage
  of an agent's work.
- **A** — The retrieval engine was the easy part. Some lifecycle hooks **failed silently**
  when implemented from official documentation alone, and context could appear to have been
  delivered while being incomplete or irrelevant. So: instrumented every context touchpoint,
  established structured benchmarks across different time windows, and built a live console
  monitoring hook delivery, retrieval quality, token usage, system health and deployment drift.
- **R (result)** — 96.0% Recall@5 and 0.922 MRR across 246,750 turns, session-start
  orientations capped at ≤1,500 tokens, and net token savings versus raw context pasting.
- **R (reflection)** — *"Documentation, research and theoretical patterns are starting
  references, not proof that a system works. Reliable AI-native development needs defined
  goals, constraints and acceptance criteria, then continuous observation and benchmarking of
  every component a coding agent produces."*

---

## Story 4 — "Shipping alone means owning the whole lifecycle"
**Tags:** end-to-end ownership · cloud · autonomy · self-direction
**Answers:** *Tell me about a project you owned · How do you learn new technology ·
What do you do without supervision · Describe your deployment experience*

- **S** — Four AI systems built outside any employer: a hybrid-retrieval memory engine, a
  self-ingesting RAG chatbot, an autonomous news agent, and a multi-agent orchestration
  pipeline.
- **T** — Get each one genuinely running, not demoed.
- **A** — Designed the architecture, built it, secured and tested it, and deployed it onto
  infrastructure set up and maintained personally — GCP Compute Engine VMs, AWS EC2, Docker,
  GitHub Actions on a 3-hour cadence, APScheduler daily ingestion, Vercel cron.
- **R (result)** — BersamaAi runs every 3 hours routing into 9 Discord channels; the INTI-MBA
  chatbot keeps 215+ documents and 3,800+ passages current with zero manual uploads across 4
  live courses.
- **R (reflection)** — Building alone forced learning the full lifecycle. Curiosity sits in
  AI, but the transferable skill is *deployment reliability*, which nothing in coursework teaches.

---

## Story 5 — "Ten nationalities and a language barrier"
**Tags:** teamwork · communication · cultural difference · customer service · humility
**Answers:** *Working in a diverse team · A difficult customer · Why did you take that job ·
Tell me about adapting to a new environment*

- **S** — Ski and snowboard technician at Ober Mountain, Gatlinburg, Tennessee, Dec 2025 –
  May 2026, on the USA Work & Travel programme, alongside colleagues from 10+ nationalities.
- **T** — Client-facing equipment service in a high-volume operation.
- **A** — Resolved customer issues through direct communication across language and cultural
  difference.
- **R (result)** — 2 Honorable Mentions for customer issue resolution.
- **R (reflection)** — *"I took that job for the experience rather than the pay."* Working
  across native languages taught what does not survive translation — and to check
  understanding rather than assume it.

---

## Story 6 — "Business-ready under time pressure"
**Tags:** delivery under pressure · presenting · product thinking · competition
**Answers:** *Tell me about a deadline · Presenting to stakeholders · A time you led ·
Why should we pick you over other graduates*

- **S** — Six competition finishes, including Champion at Young Entrepreneur Programme 2025
  (MyPSA) and Champion at Tech4Good SG Flagship 2024 (ICMS-GovTech).
- **T** — Deliver a working, business-ready product inside the event window, then defend it.
- **A** — Built to a demoable state under time pressure and presented to judges and an audience.
- **R (result)** — 2 Champion titles, Third Prize (Huawei ICT 2024), Second Prize (Blockchain
  For Good 2023), Payhack finalist, 5th Place & Best Business Idea (International Varsity 2023).
- **R (reflection)** — Judges buy a *decision*, not a feature list. Scope cutting is the skill,
  and it transfers directly to sprint delivery.

---

## Gaps still to cover — write these after your next interviews

- [ ] A story about **conflict or disagreement with a teammate** (none in the archive).
- [ ] A story about **receiving hard feedback and changing course**.
- [ ] A story about **mentoring or explaining something to a non-technical person**
      (the Yierming client work may be the source — needs a concrete instance).
- [ ] A **"why this company"** answer per employer — this is the recurring weak spot; see
      `modes/_profile.md` cover-letter paragraph 1.
