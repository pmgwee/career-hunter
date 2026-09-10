# Gwee Per Ming (Jonathan)

**AI / Software Engineer — Fresh Graduate**
Johor, Malaysia · +6011-55095871 · perminggwee@gmail.com
[Portfolio](https://www.mingcreatives.com/) · [LinkedIn](https://www.linkedin.com/in/gweeperming) · [GitHub](https://github.com/pmgwee)

**Availability:** Full-time from August 2026. Open to placement anywhere in Malaysia.
**Work authorization:** Malaysian citizen — no sponsorship required in Malaysia.

---

## Summary

<!-- BASE SUMMARY — never shipped verbatim. Every application rewrites this against
     that job description (see modes/_custom.md → House Rules). Rewriting means
     reordering, reframing and re-emphasising what this file already supports;
     it never introduces a claim that is not evidenced below. Hard ceiling: 3 lines. -->

Computer Science graduate (Dean's List x3, CGPA 3.48) and MBA candidate with six months of
fintech software engineering at iFAST Capital, where I translated a major Malaysian bank's
change requests into batch-ETL specifications and shipped an automated compliance job over
millions of account records. Since then I have designed, deployed and instrumented four AI
systems running in production on cloud infrastructure I maintain myself — hybrid RAG
retrieval, agent memory, LLM-as-a-Judge grading and multi-agent orchestration.

---

## Education

**INTI International University** — Nilai / Kuala Lumpur · *June 2026 – Present*
Master of Business Administration (Online Learning) — **CGPA 3.67**
Online delivery; does not restrict full-time employment.

**Universiti Sains Malaysia** — Gelugor, Penang · *Oct 2021 – Oct 2025*
Bachelor of Computer Science (Honours), Major in Software Engineering
**CGPA 3.48 (Second Class Upper)** · **Dean's List — 3 consecutive semesters**

**Kedah Matriculation College** — Changlun, Kedah · *Jan 2020 – Apr 2021*
Physics, Chemistry, Computer Science

---

## Skills

<!-- Five categories, in this order. The generated CV renders one row per category;
     reorder the items inside a category so the employer's own vocabulary comes
     first (see modes/_profile.md → Skills line). Never add an item here that is
     not evidenced by an Experience or Project bullet below. -->

**Programming Languages:** TypeScript, Python, SQL, Rust, Java, JavaScript, HTML, CSS

**AI Technologies:** RAG, Embeddings, Chunking, Hybrid Retrieval, Agentic Workflows,
LangGraph, LangChain, Pinecone, Prompt Engineering, Agent Skills, MCP, Tool Use,
Context Engineering, Agent Memory, Multi-Agent Orchestration, Model Evaluation,
Coding Agent, Agent Harness

**Cloud & Engineering Tools:** FastAPI, REST API, Docker, AWS EC2, AWS S3, AWS CloudFront,
AWS IAM, GCP Compute Engine, GCP OAuth 2.0 & APIs, APScheduler, GitHub Actions,
Vercel Cron Jobs, CI/CD, Git, GitLab, Jenkins, Postman, Playwright, Supabase, SQLite,
Oracle DB, Next.js

**Data & Delivery:** SQL Query Development, Query Optimization, ETL, Batch Processing,
Data Modeling, Spring Batch, Agile Sprints, Requirements Specification, UAT,
Change Request Management

**Spoken Languages:** Mandarin (Native), English, Malay

---

## Experience

### Automation Engineer Intern — iFAST Capital Sdn Bhd
*Bukit Bintang, Kuala Lumpur · March 2024 – August 2024 (6 months)*

- Partnered with a project director to translate change requests for a major Malaysian bank
  into technical specifications covering automation workflow, data specifications, batch-ETL
  data pipelines, UAT datasets and application updates, enabling end-to-end implementation
  and delivery.
- Architected an automated compliance job for sensitive customer data across millions of
  account records, optimizing complex SQL to improve execution efficiency across ~100,000
  affected rows and minimize database calls.
- Collaborated with 14 developers and 4 project directors across monthly sprints, supporting
  CI/CD pipelines, change request management and production releases for both internal and
  external business-critical fintech systems.

### Founder — Yierming Production (Studio)
*Kuala Lumpur · May 2024 – December 2025*

- Designed and launched branding and web content for an AI education startup led by a former
  technology company AI Director.
- Directed a four-digit budget commercial campaign for a Web3 brand (14K+ followers).
- Delivered digital marketing strategies for a 400K-follower F&B brand, driving 10K+ Shopee
  sales for top products.

### Ski & Snowboard Technician — Ober Mountain
*Gatlinburg, Tennessee, USA · Dec 2025 – May 2026 (USA Work & Travel)*

- Worked alongside colleagues from more than 10 nationalities in a high-volume, client-facing
  operation.
- Earned 2 Honorable Mentions for resolving customer issues through communication and
  client-facing service.

---

## Projects

### [Cross-Agent Context Engineering with Persistent Second Brain](https://github.com/pmgwee/agent-knowledge-base-codex)
*Rust · Obsidian · Hybrid RAG Retrieval · all-MiniLM-L6-v2 · SQLite FTS5 · Codegraph · MCP ·
Claude Code & Codex Lifecycle Hooks · LongMemEval · Next.js*

- Engineered a transcript-native persistent memory extending the LLM-wiki pattern to
  consolidate evidence-cited, wikilinked memories into Obsidian, achieving zero cold-start
  latency on memory collection.
- Integrated Claude Code and Codex via native lifecycle hooks plus codegraph, combining BM25,
  vector search and graph RRF, achieving **96.0% Recall@5 and 0.922 MRR across 246,750 turns**
  while capping session-start orientations at ≤1,500 tokens.
- Achieved net token savings against raw context pasting, building a Next.js console to track
  real-time system condition, retrieval quality, hook delivery status, token baselines and
  deployment drift.

### [RAG Chatbot with Self Auto-Ingestion (INTI-MBA Chatbot)](https://github.com/pmgwee/Ai-Chatbot)
*FastAPI · LangGraph · LangChain · Hybrid RAG Retrieval · Pinecone · RapidOCR · APScheduler ·
Docker · AWS EC2 · Next.js*

- Engineered a LangGraph RAG agent implementing multi-query retrieval, LLM document grading
  and query-rewriting self-correction, delivering cited answers grounded to source files
  across 4 live Canvas LMS MBA courses.
- Automated daily ingestion with APScheduler, keeping **215+ documents and 3,800+ searchable
  passages** continuously up to date with zero manual uploads.

### [Autonomous Trending News AI Agent (BersamaAi)](https://github.com/pmgwee/BersamaAi-community)
*GCP Compute Engine · Python · Agent Harness · Discord MCP · GLM-5.2 · Groq Whisper ASR ·
yt-dlp · GitHub Actions*

- Built a workflow that ingests online sources and routes each candidate through a GLM-5.2
  LLM-as-a-Judge that grades relevance and classifies it into one of 9 topic channels,
  posting cards to Discord every 3 hours via GitHub Actions.
- Deployed an LLM-powered Discord community bot with an MCP server exposing Discord as a tool
  surface to AI agents, running on a GCP VM.
- Handled caption-less video via an ASR model on a daily GCP cron job that summarizes curated
  YouTube channel videos.

### [Multi-Agent Routing Orchestration Claude Skills](https://github.com/pmgwee/Multi-Agent-Autopilot)
*Agent Skills · JavaScript · Prompt Engineering · Playwright · MCP*

- Architected a hands-off pipeline (kickstart, autopilot, UAT-runbook) chaining a top-tier
  planning model with a cheaper CLI executor model, cutting manual prompting to zero and
  enabling crash-safe resumption across sessions.
- Built an automated looped evaluation layer delivering Playwright screenshot evidence for a
  top-tier model to perform code review at each delivery phase.

### [LLM-Backed Music Recommendation & Real-Time LLM Usage Tracker](https://github.com/pmgwee/ai-music-recommendations)
*GLM-5.2 · Next.js · TypeScript · Supabase · YouTube API · GCP OAuth 2.0 · Telegram Bot ·
Tailwind CSS · Vercel*

- Engineered an LLM-driven recommendation algorithm analyzing listening habits and imported
  playlists to rank candidate tracks, generating smooth playlists with ~85% fresh songs that
  accurately captured true user preferences.
- Built a real-time dashboard tracking live LLM provider usage across subscription and API-key
  accounts, with a Telegram webhook triggering real-time notification alerts.

---

## Achievements

- **Champion** — Young Entrepreneur Programme (YEP) 2025, MyPSA
- **Champion** — Tech4Good SG Flagship 2024, ICMS-GovTech
- **Third Prize** — Huawei ICT Innovation Track 2024, Huawei
- **Second Prize** — Blockchain For Good Malaysia Inter-Varsity Hackathon 2023, UTM-Algohub
- **Finalist** — Payhack 24-Hour Hackathon 2023, PayNet
- **5th Place & Best Business Idea Award** — International Varsity Hackathon 2023, USM

---

## Volunteering

**Luarlah Cultural Liaison** · *Oct 2025*
Bridged urban participants with Orang Asli communities through indigenous cultural immersion,
supporting Luarlah's mission to reconnect Malaysia's 73% urban population with rural heritage.

**EPIC Homes House Builder** · *Jul 2025*
Completed a 3-day modular home build for an Orang Asli family, contributing to 350+ homes
delivered nationwide to address a housing crisis affecting 12,000+ families.

**Sea Turtle Research Unit (SEATRU) Conservation Field Volunteer** · *Jul 2025*
Conducted nocturnal beach patrols, turtle tagging and nest monitoring to improve hatchling
survival against natural odds of 1 in 1,000, within a programme engaging 5,700+ individuals
from 36 countries.

---

## Certifications

*None yet.* — Open item: AWS Cloud Practitioner or Azure AZ-900 would fill this section
cheaply. Three employer application forms have already asked for it.
