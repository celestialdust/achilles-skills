---
name: project-setup
description: Scaffolds the repo ecosystem every achilles skill assumes — a one-time bootstrap that creates the STATE.md board, the CONTEXT.md glossary, docs/adr/, and docs/features/, and — when the repo has neither a CLAUDE.md nor an AGENTS.md and you opt to create CLAUDE.md — seeds it from a bundled behavioral template. Run this ONCE before the first feature, before interview-me or spec-grilling. The pipeline skills read these files cold and will have nowhere to write without it, so do this first.
---

## Purpose

Stage: **cross-cutting / setup** (one-time). Every downstream skill reads and writes a *shared substrate*:
the `STATE.md` board (what's in flight + who owns the next action), the per-feature artifact directories,
and the repo-wide design substrate (`CONTEXT.md` glossary + `docs/adr/`). If that substrate doesn't exist,
each skill has to re-derive "where do issues live / where's the glossary / where do ADRs go" — which is
exactly the scattered-tracker problem this suite consolidates away (D13 §4.1: one local board, not mp's
several issue queues). `project-setup` makes the substrate exist **once**, so the rest of the suite consumes it cold.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with
the user, then write. It is **distinct from `preflight-readiness`**: `preflight-readiness` is a per-run environment gate that
re-fires every wave; `project-setup` is the one-time repo bootstrap that runs before any feature exists (D16).

## When to use / when to skip

- **Use** once per repo, before the first feature — before `interview-me`, `idea-refine`, or `spec-grilling`.
- **Skip** if `STATE.md` already exists at the repo root and the substrate is intact; you don't need to
  re-run per feature (the board is appended to by `plan-breakdown`, not re-scaffolded).
- **Escape hatch — adopt, don't overwrite:** if the repo already has a `CONTEXT.md`, `docs/adr/`, or a
  `CLAUDE.md`/`AGENTS.md` with prior content, adopt them in place. Re-running `project-setup` repairs missing pieces;
  it never clobbers existing user content.

## Inputs

Foundation only — this is the bootstrap; it has no upstream artifact and no refuse-to-run dependency. It
reads the repo as-is to decide what already exists:

- `git remote -v` / `.git/config` — is there a remote? (informational only; the tracker is local regardless.)
- root `CLAUDE.md` and `AGENTS.md` — does either exist? Is there already an `## Agent skills` section?
- root `CONTEXT.md` / `CONTEXT-MAP.md` — single- or multi-context already?
- `docs/adr/`, `docs/features/`, `STATE.md` — does prior output already exist?

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config` — is this a remote-backed repo? (Informational — does not change the tracker.)
- `CLAUDE.md` and `AGENTS.md` at the repo root — does either exist? Is there already an `## Agent skills` section?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root — is a single- or multi-context layout already implied?
- `docs/adr/` and any `src/*/docs/adr/` directories.
- `docs/features/` and `STATE.md` — does this skill's prior output already exist?

### 2. Present findings and ask

Summarise what's present and what's missing. Then walk the user through the decisions **one at a time** —
present a section, get the answer, then move on. Don't dump everything at once.

Assume the user does not know what these terms mean. Each section starts with a short explainer (what it is,
why these skills need it, what changes if they pick differently), then the choices and the default.

**There is no issue-tracker question.** In this suite the tracker is **always** the local `STATE.md` board
(D13): a two-level board (features → slices) with a `gate` column that absorbs mp's
`ready-for-agent`/`ready-for-human` triage roles. So the source's GitHub/GitLab/local choice and its
five-label vocabulary are **already decided** — you scaffold `STATE.md`, you do not ask where issues live.
Mention this once so the user knows their GitHub Issues (if any) are intentionally not the work surface here.

**Section A — Domain doc layout** (the one surviving choice).

> Explainer: Several skills (`spec-grilling`, `code-review`, `quality-verification`, `incremental-implementation`) read `CONTEXT.md` for the
> project's domain language and `docs/adr/` for past architectural decisions. They need to know whether the
> repo has one global context or several (e.g. a monorepo with separate frontend/backend contexts) so they
> look in the right place.

- **Single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root. Most repos are this. **(Default.)**
- **Multi-context** — `CONTEXT-MAP.md` at the root pointing to per-context `CONTEXT.md` files (a monorepo).

If **neither** `CLAUDE.md` nor `AGENTS.md` exists, also ask **which one to create** — don't pick for them.
Note that a fresh `CLAUDE.md` is seeded with a small set of project-agnostic behavioral guidelines (the
bundled `assets/CLAUDE.template.md`) above the `## Agent skills` wiring; a fresh `AGENTS.md` gets the wiring
only.

### 3. Confirm and edit

Show the user a draft of everything before writing, and let them edit:

- The `STATE.md` skeleton (the empty board with the D13 legend; see "STATE.md seed" below).
- The `CONTEXT.md` stub (glossary-only).
- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited.
- If a fresh `CLAUDE.md` is being created, the bundled behavioral template (`assets/CLAUDE.template.md`) that
  seeds it — the user can edit it now or later (it's a starting point, not a fixed contract).

### 4. Write

**Pick the file to edit (verbatim file-selection rules):**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, create the one the user chose in Section A — never pick for them.
- **Never** create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa) — always edit the one already
  there. If an `## Agent skills` block already exists, update it in place rather than appending a duplicate;
  don't overwrite the surrounding sections.
- **Seeding a fresh `CLAUDE.md`:** only when neither file exists and the user chose `CLAUDE.md`, write the
  bundled behavioral template (`assets/CLAUDE.template.md`) first, then append the `## Agent skills` block
  below it (see "CLAUDE.md seed" below). A fresh `AGENTS.md` gets the `## Agent skills` block only — no
  behavioral template. Never seed over a `CLAUDE.md` that already exists; edit it in place.

Then create the substrate (skip anything that already exists; never clobber):

1. **`STATE.md`** at the repo root — the empty two-level board with the D13 §4.1 legend (see seed below).
2. **`CONTEXT.md`** at the repo root (or `CONTEXT-MAP.md` + per-context `CONTEXT.md` for multi-context) —
   the glossary stub with a `## Glossary` heading, devoid of implementation detail (D18; see "CONTEXT.md
   seed" below). The `## Glossary` heading is mandatory — `spec-grilling` appends terms under it.
3. **`docs/adr/`** — repo-wide ADR home (seed a `.gitkeep`; ADRs are named `ADR-<NNN>-<slug>.md`).
4. **`docs/features/`** — per-feature artifact root (`docs/features/<slug>/` holds intent.md, prd.md,
   acceptance.md, environment.md, plan.md per feature; seed a `.gitkeep`).
5. The **`## Agent skills`** block in the chosen file (see below), pointing at `STATE.md`, `CONTEXT.md`,
   and `docs/adr/`. The domain-doc consumer rules carry over from `references/domain-docs.md`.

The `## Agent skills` block:

```markdown
## Agent skills

This repo is configured for the achilles-skills pipeline (run once by `project-setup`).

### State board
Work-in-flight lives in `STATE.md` at the repo root — a local two-level board (features → slices) with a
`gate` column marking who owns the next action. This is the only work tracker; there is no GitHub/GitLab
issue queue. See `STATE.md`.

### Domain docs
Single-context: `CONTEXT.md` + `docs/adr/` at the root. (Multi-context: `CONTEXT-MAP.md` → per-context
`CONTEXT.md`.) Skills read these before exploring; consumer rules in the project-setup skill's
`references/domain-docs.md`.

### Per-feature artifacts
Each feature's intent.md / prd.md / acceptance.md / environment.md / plan.md live under
`docs/features/<slug>/`.
```

### 5. Done

Tell the user setup is complete and which skills now read from these files (`spec-grilling` appends
`CONTEXT.md` and writes `docs/adr/`; `interview-me`/`idea-refine` write `docs/features/<slug>/intent.md`;
`plan-breakdown` adds feature blocks + slice rows to `STATE.md`; the orchestrator drives `STATE.md`).
Mention the docs are hand-editable later; re-running `project-setup` is only needed to repair or re-scaffold.

## STATE.md seed (D13 §4.1)

Write this empty board — the legend header is the stable section downstream consumers depend on; no feature
blocks yet (those are born from an already-sliced plan, added by `plan-breakdown`):

```markdown
# Pipeline State — <project>

> Single source of truth for what's in flight. The orchestrator drives slice rows; the human reads the
> `gate` column to know what needs them. No emojis; text tokens only.

feature state:  spec · plan · building · done          ← the PRD's stage
slice state:    impl · verify · review · ship · done · blocked · halted
gate:           you · agent · done                     ← who owns the next action

<!-- Feature blocks are added by plan-breakdown. Slice ids are PRD-namespaced. Example shape:

## PWR · Password reset                          feature: building
origin:  prd.md · acceptance.md · plan.md
| Slice  | Title                       | State   | Gate  | Blocked by | Artifacts |
|--------|-----------------------------|---------|-------|-----------|-----------|
| PWR-1  | request reset link          | impl    | agent | —         | —         |
-->
```

## CONTEXT.md seed

Write this glossary stub — the `## Glossary` heading is the stable section `spec-grilling` appends terms
under (canonical heading; do not rename); no terms yet (those emerge as the ubiquitous language is sharpened):

```markdown
# <project>

## Glossary

<!-- Domain terms are appended here by spec-grilling as the ubiquitous language emerges.
One term per line: term — one-sentence definition. No implementation detail (D18). -->
```

For multi-context, seed `CONTEXT-MAP.md` at the root plus one per-context `CONTEXT.md`, each carrying its
own `## Glossary` heading.

## CLAUDE.md seed (only when creating a fresh CLAUDE.md)

When the repo has **neither** `CLAUDE.md` nor `AGENTS.md` and the user chose to create `CLAUDE.md`, seed it
from the bundled template `assets/CLAUDE.template.md` **before** adding the `## Agent skills` block. The
template is a project-agnostic set of behavioral guidelines — *Think Before Coding · Simplicity First ·
Surgical Changes · Goal-Driven Execution* — adapted from Andrej Karpathy's notes on LLM coding pitfalls (via
`multica-ai/andrej-karpathy-skills`). Write the template verbatim, then append the achilles wiring beneath it.
Do **not** write the template into an `AGENTS.md`, and never seed over a `CLAUDE.md` that already exists — in
that case you edit the existing file and add only the `## Agent skills` block.

## Rationalizations

- "This repo already tracks issues on GitHub — skip `STATE.md`." → No. The suite's board **is** `STATE.md`
  (consolidated local tracker, D13). GitHub Issues are intentionally not the work surface.
- "I'll create `CONTEXT.md` later when there are terms." → No. The substrate must exist before `spec-grilling`
  has somewhere to append; scaffold the stub now (empty glossary is fine).
- "Multi-context looks more thorough — default to it." → No. Default is **single-context**; only a real
  monorepo with separate contexts warrants `CONTEXT-MAP.md`.
- "Neither CLAUDE.md nor AGENTS.md exists, I'll just create both / pick one." → No. Ask the user which one;
  never create both.
- "I'll dump all the choices in one message to save turns." → No. One decision at a time; assume the user
  doesn't know the terms.

## Red flags

- Overwriting an existing `CONTEXT.md`, `STATE.md`, or `## Agent skills` block without reading it first.
- Creating `AGENTS.md` when `CLAUDE.md` already exists (or vice versa).
- Asking "where should issues live / GitHub or local?" — that decision is gone (tracker = local `STATE.md`).
- Writing any value, secret, or shell command into a scaffolded file (these files are structure, not config).
- Seeding `STATE.md` with feature/slice rows — `project-setup` leaves the board empty.
- Writing the behavioral `CLAUDE.md` template into an `AGENTS.md`, or over a `CLAUDE.md` that already exists.

## Verification (ending criteria)

Done when **all** hold:

- `STATE.md` exists at the repo root and contains the three legend lines with the D13 token sets exactly:
  `feature state: spec · plan · building · done`, `slice state: impl · verify · review · ship · done ·
  blocked · halted`, `gate: you · agent · done`. No feature blocks.
- `CONTEXT.md` (or `CONTEXT-MAP.md` for multi-context) exists at the repo root.
- `CONTEXT.md` contains a `## Glossary` heading (for multi-context, each per-context `CONTEXT.md` does).
- `docs/adr/` and `docs/features/` directories exist.
- Exactly one of `CLAUDE.md` / `AGENTS.md` contains an `## Agent skills` block referencing `STATE.md`,
  `CONTEXT.md`, and `docs/adr/`; the other file was not created.
- If a fresh `CLAUDE.md` was created (neither file existed and the user chose it), it leads with the bundled
  behavioral template and the `## Agent skills` block follows; no template was written into an `AGENTS.md` or
  over a pre-existing `CLAUDE.md`.
- No pre-existing user content was overwritten.

## Outputs & handoff contract

Emits the repo substrate the whole suite consumes:

| Artifact | Location | Stable section(s) downstream depend on |
|---|---|---|
| `STATE.md` | repo root | the D13 §4.1 header: `feature state` / `slice state` / `gate` legends (empty board) |
| `CONTEXT.md` | repo root | `## Glossary` (terms only, no implementation detail — D18) |
| `docs/adr/` | repo-wide | the ADR home (`ADR-<NNN>-<slug>.md`) |
| `docs/features/` | repo-wide | per-feature artifact root (`docs/features/<slug>/`) |
| `CLAUDE.md` / `AGENTS.md` | repo root | the `## Agent skills` block; a fresh `CLAUDE.md` also leads with the bundled behavioral template |

Downstream consumers: `interview-me`/`idea-refine` → `docs/features/<slug>/intent.md`; `spec-grilling` →
appends `CONTEXT.md` + writes `docs/adr/`; `to-prd`/`acceptance-criteria`/`environment-manifest` → `docs/features/<slug>/`;
`plan-breakdown` → adds feature blocks + PRD-namespaced slice rows to `STATE.md`; the orchestrator drives
the slice/gate columns. tracker = local. `STATE.md` update by `project-setup`: create the empty board only.
