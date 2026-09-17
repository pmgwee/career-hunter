# Gwee Per Ming (Jonathan) — Triage Brief

<!-- ============================================================
     THIS FILE IS YOURS. Copy it to `modes/_brief.md` (doctor.mjs
     auto-copies it on first run) and fill in the placeholders.
     It is USER LAYER — never auto-updated by `node update-system.mjs`.

     PURPOSE: Compact context for first-pass triage agents
     (`modes/triage.md`). It replaces reading the full evaluation
     stack — cv.md + _shared.md + _profile.md + profile.yml +
     oferta.md (tens of thousands of tokens) — with a single small
     read (~1.5–2K tokens). Full context is still used in full eval.

     KEEP IT SHORT. Every line here is read once per role during a
     batch triage. Include only what changes a go/no-go decision:
     archetypes, comp floor, location policy, hard disqualifiers,
     and your strongest proof points. Leave the deep narrative,
     negotiation scripts, and STAR stories in _profile.md / cv.md.
     ============================================================ -->

## Identity
Graduate / junior AI, data and software engineer with six months of fintech software
engineering experience. Based in Tangkak, Johor (MYT, UTC+8). Malaysian citizen with
no sponsorship needed in Malaysia; sponsorship is required outside Malaysia.

## Target Archetypes
The roles you actually want. Triage scores "archetype fit" against this list.
A direct hit scores 4–5; an adjacent title scores 3; a mismatch scores 1–2.

| # | Archetype | What they buy (your proof) |
|---|-----------|----------------------------|
| 1 | **AI / Applied AI Engineer** | Ships and instruments production AI systems, including RAG and agentic workflows |
| 2 | **Data Engineer / Analytics Engineer** | Regulated-data batch ETL, SQL optimization and requirements translation at iFAST |
| 3 | **Graduate Programme / Campus Hire** | Computer Science CGPA 3.48, Dean's List x3, MBA CGPA 3.67 and two Champion titles |
| 4 | **Cloud / Platform / DevOps Engineer** | Self-runs production infrastructure across GCP and AWS with CI/CD and observability |
| 5 | **Technology Consultant (AI & Data)** | Bridges business change and engineering delivery in a regulated fintech environment |

<!-- Optional: "analog" archetypes — same skills, different titles. List them so
     triage recognizes them as valid targets instead of scoring them as misses. -->

## Proof Points (use exact metrics in matching)
Your strongest, quantified accomplishments. Triage checks how many map to a JD.
- Cross-Agent Context Engineering achieved 96.0% Recall@5 and 0.922 MRR across 246,750 turns.
- INTI-MBA RAG keeps 215+ documents and 3,800+ searchable passages current across four live courses.
- iFAST compliance automation operated across millions of account records and ~100,000 affected rows.
- Competition record includes two Champion titles and six podium or finalist finishes.

## Comp Strategy
| Target | Requirement |
|--------|-------------|
| RM 4,500–5,000/month | Graduate schemes, consulting and fixed published bands |
| RM 5,000–6,000/month | Well-funded technology employers and stronger-scope engineering roles |

**Hard floor: RM 4,500/month. Below that, FAIL regardless of other signals.**

## Location Scoring
- Malaysia, Kuala Lumpur / Klang Valley → **5.0**
- Elsewhere in Malaysia → **4.0–5.0** depending on role and relocation requirements
- Singapore → score only after sponsorship and salary eligibility clear the hard-DQ checks
- Remote role based outside Malaysia → eligible only with a Malaysian entity or contractor arrangement
- High travel (>25%) → **deduct 0.5–1.0**

## Hard DQ Criteria — instant FAIL (< 3.0)
Score ≤ 2.5 immediately and skip detailed analysis if ANY apply.
- Stated Malaysian monthly compensation ceiling below RM 4,500.
- Role outside Malaysia explicitly states that sponsorship is unavailable.
- Singapore traineeship restricted to Singapore citizens or permanent residents.
- Singapore role whose monthly base cannot support a viable work-pass route; ask when pay is undisclosed.
- Remote foreign role cannot engage a Malaysian contractor and has no Malaysian entity.

## Quick Scoring Guide

Bands are relative to `triage_threshold` (`config/profile.yml → pipeline.triage_threshold`,
default **3.5**), matching the verdict table in `modes/triage.md` — so a score at or
above the threshold is PASS, and only the band below it is MARGINAL.

| Score | Verdict | What it means |
|-------|---------|---------------|
| ≥ threshold (default 3.5) | **PASS** | Clears the bar — strong archetype + comp + location, gaps bridgeable |
| 3.0 – (threshold − 0.1) | **MARGINAL** | Borderline — shown to user as one line |
| < 3.0 | **FAIL** | Does not clear the bar — filtered |

## Soft Red Flags (−0.5 each, additive)
Not disqualifiers, but they lower the score.
- Mandatory professional certification not currently held.
- Role is materially senior to graduate / junior level.
- Core work is outside AI, data, software, cloud/platform or technology consulting.
- Job offers little hands-on engineering, delivery ownership or technical growth.

## Priority Override List — always return PASS regardless of score
No permanent override list. A user-stated priority or warm introduction for a specific
role overrides triage for that role only.
