---
name: project-setup
description: Scaffolds the repo ecosystem every achilles skill assumes — a one-time bootstrap that creates the STATE.md board, the CONTEXT.md glossary, docs/adr/, docs/features/, and docs/workflow.md (the process contract stating the stages, who owns each gate, where a run ends, and what stops one), and — when the repo has neither a CLAUDE.md nor an AGENTS.md and you opt to create CLAUDE.md — seeds it from a bundled behavioral template. Run this ONCE before the first feature, before interview-me or spec-grilling. The pipeline skills read these files cold and will have nowhere to write without it, so do this first.
---

## Purpose

Stage: **cross-cutting / setup** (one-time). Every downstream skill reads and writes a *shared substrate*:
the `STATE.md` board (what's in flight + who owns the next action), the per-feature artifact directories,
and the repo-wide design substrate (`CONTEXT.md` glossary + `docs/adr/`). If that substrate doesn't exist,
each skill has to re-derive "where do issues live / where's the glossary / where do ADRs go" — which is
exactly the scattered-tracker problem this suite consolidates away (one local board, not mp's
several issue queues). `project-setup` makes the substrate exist **once**, so the rest of the suite consumes it cold.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with
the user, then write. It is **distinct from `preflight-readiness`**: `preflight-readiness` is a per-run environment gate that
re-fires every wave; `project-setup` is the one-time repo bootstrap that runs before any feature exists.

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

**There is no issue-tracker question.** In this suite the tracker is **always** the local `STATE.md` board:
a two-level board (features → slices) with a `gate` column that absorbs mp's
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

- The `STATE.md` skeleton (the empty board with the legend; see "STATE.md seed" below).
- The `CONTEXT.md` stub (glossary-only).
- The bundled process contract (`assets/workflow.template.md`) that becomes `docs/workflow.md`. Show it —
  it states the stages, the gate owners, and the stop conditions on the repo's behalf — but copy it
  verbatim; it is one shared text, not a per-repo draft.
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

Then create the substrate (skip anything that already exists; never clobber). The one exception is
`docs/workflow.md`, which is compared rather than skipped — see item 6 for why and how.

1. **`STATE.md`** at the repo root — the empty two-level board with the legend (see seed below).
2. **`CONTEXT.md`** at the repo root (or `CONTEXT-MAP.md` + per-context `CONTEXT.md` for multi-context) —
   the glossary stub with a `## Glossary` heading, devoid of implementation detail (see "CONTEXT.md
   seed" below). The `## Glossary` heading is mandatory — `spec-grilling` appends terms under it.
3. **`docs/adr/`** — repo-wide ADR home (seed a `.gitkeep`; ADRs are named `ADR-<NNN>-<slug>.md`).
4. **`docs/features/`** — per-feature artifact root (`docs/features/<slug>/` holds intent.md, prd.md,
   acceptance.md, environment.md, plan.md per feature; seed a `.gitkeep`).
5. The **`## Agent skills`** block in the chosen file (see below), pointing at `STATE.md`, `CONTEXT.md`,
   `docs/adr/`, and `docs/workflow.md`. The domain-doc consumer rules carry over from
   `references/domain-docs.md`.
6. **`docs/workflow.md`** — the process contract, copied **verbatim** from the bundled
   `assets/workflow.template.md`: the stages, who owns each gate, where a run ends, what stops a run, what
   is frozen, and what never happens. It exists so a person can read the whole process from the repo's own
   files, with nothing installed — so do not summarise it, re-word it, or trim it to fit. A repo whose copy
   has drifted documents a process that is not the one running in it.

   **If the file already exists, compare it against the bundled template instead of skipping it.** This
   one file is shared text rather than the user's own writing, so "it's already there" is no evidence it
   is current: a copy left over from an older version, or a well-meant hand-edit, is exactly the drift
   that makes the repo describe a process it is not running. If the two differ, show the difference and
   ask before writing anything. On a yes, re-copy the bundled template over it. On a no, leave their copy
   untouched and say plainly that it no longer matches the process the skills actually run, so they can
   decide later. Never overwrite it silently — asking first is what keeps the never-clobber rule whole
   while still giving drift a way to get fixed.

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

### Process contract
`docs/workflow.md` states how work ships here: the stages, who owns each gate, where a run ends, what
stops one, what is frozen, and what never happens. Read it first — nothing has to be installed to read
it. It is shared text copied verbatim, not a per-repo draft; do not edit it locally.
```

### 5. Done

Tell the user setup is complete and which skills now read from these files (`spec-grilling` appends
`CONTEXT.md` and writes `docs/adr/`; `interview-me`/`idea-refine` write `docs/features/<slug>/intent.md`;
`plan-breakdown` adds feature blocks + slice rows to `STATE.md`; the orchestrator drives `STATE.md`).
Mention that `STATE.md`, `CONTEXT.md`, and the per-feature docs are theirs to hand-edit later, but
`docs/workflow.md` is shared text — editing it locally makes the repo describe a process it is not
running. Re-running `project-setup` is only needed to repair, re-scaffold, or re-sync a `docs/workflow.md`
that has drifted from the bundled contract.

## STATE.md seed

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
| Slice  | Title              | Design ref                     | State   | Gate  | Blocked by | Artifacts |
|--------|--------------------|--------------------------------|---------|-------|-----------|-----------|
| PWR-1  | request reset link | `docs/features/pwr/design-contract.md` | impl | agent | —      | —         |
| PWR-2  | expire stale tokens| —                              | impl    | agent | PWR-1     | —         |
-->
```

`Design ref` holds the signed design contract + prototype the slice builds against, or `—` for a slice that
builds no UI. The orchestrator copies it into both the implement and the verify dispatch brief, so a `—` has
to be recorded rather than left blank — blank reads as "nobody looked".

## CONTEXT.md seed

Write this glossary stub — the `## Glossary` heading is the stable section `spec-grilling` appends terms
under (canonical heading; do not rename); no terms yet (those emerge as the ubiquitous language is sharpened):

```markdown
# <project>

## Glossary

<!-- Domain terms are appended here by spec-grilling as the ubiquitous language emerges.
One term per line: term — one-sentence definition. No implementation detail. -->
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
  (consolidated local tracker). GitHub Issues are intentionally not the work surface.
- "I'll create `CONTEXT.md` later when there are terms." → No. The substrate must exist before `spec-grilling`
  has somewhere to append; scaffold the stub now (empty glossary is fine).
- "Multi-context looks more thorough — default to it." → No. Default is **single-context**; only a real
  monorepo with separate contexts warrants `CONTEXT-MAP.md`.
- "Neither CLAUDE.md nor AGENTS.md exists, I'll just create both / pick one." → No. Ask the user which one;
  never create both.
- "I'll dump all the choices in one message to save turns." → No. One decision at a time; assume the user
  doesn't know the terms.
- "`docs/workflow.md` is already there — skip it like everything else." → No. Everything else in the
  substrate is the user's content, so existing means leave it. This file is shared text, so existing only
  means *some* copy is there. Diff it against the bundled template; if it drifted, show the difference and
  ask before re-copying.
- "Their `docs/workflow.md` is out of date, so I'll just overwrite it." → No. Ask first. Silent overwrite
  is the clobber this skill exists to avoid, and a hand-edit may be deliberate.

## Red flags

- Overwriting an existing `CONTEXT.md`, `STATE.md`, or `## Agent skills` block without reading it first.
- Creating `AGENTS.md` when `CLAUDE.md` already exists (or vice versa).
- Asking "where should issues live / GitHub or local?" — that decision is gone (tracker = local `STATE.md`).
- Writing any value, secret, or shell command into a scaffolded file (these files are structure, not config).
- Seeding `STATE.md` with feature/slice rows — `project-setup` leaves the board empty.
- Writing the behavioral `CLAUDE.md` template into an `AGENTS.md`, or over a `CLAUDE.md` that already exists.
- Summarising, re-wording, or trimming `docs/workflow.md` instead of copying the bundled template verbatim.
- Passing over an existing `docs/workflow.md` without diffing it against the bundled template — or finding
  a drift and neither re-copying nor telling the user their copy no longer matches.
- Overwriting a drifted or hand-edited `docs/workflow.md` without showing the difference and asking first.

## Verification (ending criteria)

Done when **all** hold:

- `STATE.md` exists at the repo root and contains the three legend lines with the token sets exactly:
  `feature state: spec · plan · building · done`, `slice state: impl · verify · review · ship · done ·
  blocked · halted`, `gate: you · agent · done`. No feature blocks.
- The commented example slice header carries the full column list in order —
  `| Slice | Title | Design ref | State | Gate | Blocked by | Artifacts |` — so the rows `plan-breakdown`
  writes later land in a board shape the orchestrator can read.
- `CONTEXT.md` (or `CONTEXT-MAP.md` for multi-context) exists at the repo root.
- `CONTEXT.md` contains a `## Glossary` heading (for multi-context, each per-context `CONTEXT.md` does).
- `docs/adr/` and `docs/features/` directories exist.
- `docs/workflow.md` exists, carrying all six sections: `## The stages`, `## Who owns each gate`,
  `## Where a run ends`, `## What stops a run`, `## What is frozen`, `## What never happens`.
- `docs/workflow.md` is byte-identical to the bundled `assets/workflow.template.md` — or, on a re-run over
  a copy that had drifted, the difference was shown to the user and they chose to keep their version. A
  drift that was never surfaced fails this criterion; a drift the user knowingly kept does not.
- Exactly one of `CLAUDE.md` / `AGENTS.md` contains an `## Agent skills` block referencing `STATE.md`,
  `CONTEXT.md`, `docs/adr/`, and `docs/workflow.md`; the other file was not created.
- If a fresh `CLAUDE.md` was created (neither file existed and the user chose it), it leads with the bundled
  behavioral template and the `## Agent skills` block follows; no template was written into an `AGENTS.md` or
  over a pre-existing `CLAUDE.md`.
- No pre-existing user content was overwritten.

## Outputs & handoff contract

Emits the repo substrate the whole suite consumes:

| Artifact | Location | Stable section(s) downstream depend on |
|---|---|---|
| `STATE.md` | repo root | the header: `feature state` / `slice state` / `gate` legends, plus the slice-row column list `Slice · Title · Design ref · State · Gate · Blocked by · Artifacts` (empty board) |
| `CONTEXT.md` | repo root | `## Glossary` (terms only, no implementation detail) |
| `docs/adr/` | repo-wide | the ADR home (`ADR-<NNN>-<slug>.md`) |
| `docs/features/` | repo-wide | per-feature artifact root (`docs/features/<slug>/`) |
| `docs/workflow.md` | repo-wide | the six process sections — stages · gate owners · where a run ends · what stops a run · what is frozen · what never happens — a verbatim copy of `assets/workflow.template.md`, re-synced (with the user's yes) whenever a re-run finds it drifted |
| `CLAUDE.md` / `AGENTS.md` | repo root | the `## Agent skills` block; a fresh `CLAUDE.md` also leads with the bundled behavioral template |

Downstream consumers: `interview-me`/`idea-refine` → `docs/features/<slug>/intent.md`; `spec-grilling` →
appends `CONTEXT.md` + writes `docs/adr/`; `to-prd`/`acceptance-criteria`/`environment-manifest` → `docs/features/<slug>/`;
`plan-breakdown` → adds feature blocks + PRD-namespaced slice rows to `STATE.md`; the orchestrator drives
the slice/gate columns. tracker = local. `STATE.md` update by `project-setup`: create the empty board only.
