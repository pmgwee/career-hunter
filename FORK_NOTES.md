# career-hunter — fork notes

This is **Gwee Per Ming's private working copy** of [career-ops](https://github.com/santifer/career-ops)
by [santifer](https://santifer.io), used as the command center for an active job search.

> ⚠️ **This repository is PRIVATE and must stay private.**
> Unlike upstream career-ops, this copy deliberately commits the user-layer files that
> upstream `.gitignore`s — `cv.md`, `config/profile.yml`, `data/applications.md`,
> `article-digest.md`, `modes/_profile.md`, `interview-prep/story-bank.md`. Those contain a
> full name, phone number, home address, email, academic records and application history.
> **Making this repo public would publish all of it.**

## Upstream

| | |
|---|---|
| Upstream | `https://github.com/santifer/career-ops.git` (remote `origin`) |
| This fork | `https://github.com/pmgwee/career-hunter.git` (remote `career-hunter`) |
| Forked at | `cc841f4` — career-ops v1.28.0 |
| Upstream licence | MIT — see [`LICENSE`](LICENSE) |

All system-layer files (`*.mjs`, `modes/` except `_profile.md`/`_custom.md`/`_brief.md`,
`dashboard/`, `templates/`, `batch/`, `AGENTS.md`) are santifer's work, unmodified.
The user-layer files listed above are the only original content here.

## Pulling upstream updates

```bash
node update-system.mjs check
```

The updater only touches system-layer files. Your data — CV, profile, tracker, reports —
is never modified. See `DATA_CONTRACT.md` for the full two-layer split.

## What is deliberately NOT committed

| Path | Why |
|---|---|
| `.claude/settings.local.json` | Machine-local CLI config; may hold MCP credentials |
| `.remember/` | Session transcript buffers — churn on every session, regenerable |
| `data/applications.db` | Binary, derived from `data/applications.md` |
| `dashboard/career-dashboard.exe` | Compiled binary — rebuild with `npm run build:dashboard` |
| `node_modules/`, `output/`, `jds/`, `reports/*.md` | Generated or PII per upstream `.gitignore` |

Personal files are tracked via `git add -f` rather than by editing `.gitignore`, so the
upstream ignore rules stay intact and future `update-system.mjs` syncs do not conflict.
**When you add a new personal file, it will be ignored by default — force-add it explicitly.**

## Local setup on this machine

- Node.js v24.15.0
- Go 1.26.7 (for the dashboard TUI — `npm run serve:dashboard`)
- Playwright Chromium (installed via `postinstall`)
